import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  BMP_MAX,
  HIGH_SURROGATE_MIN,
  LOW_SURROGATE_MAX,
  LOW_SURROGATE_MIN,
  SUPPLEMENTARY_BASE,
  SURROGATE_BITS,
  SURROGATE_BLOCK_SIZE,
  assignableCodePoints,
  bytesToUnit,
  ceilingFromSurrogates,
  fromSurrogatePair,
  isHighSurrogate,
  isLowSurrogate,
  toHex,
  toSurrogatePair,
  unitToBytes,
  utf16ByteLength,
  utf16Units,
  utf16UnitsForText,
  utf32ByteLength,
} from "../../curriculum/08-utf-encodings/encodings";
import { MAX_CODE_POINT, encodeText } from "../../curriculum/07-utf-8/utf8";

/** JavaScript strings are UTF-16, so the runtime is the oracle for the whole encoding. */
function platformUnits(text: string) {
  return Array.from({ length: text.length }, (_, index) => text.charCodeAt(index));
}

describe("UTF-16 matches the runtime's own UTF-16", () => {
  it("agrees on the characters the curriculum uses", () => {
    for (const text of ["A", "é", "न", "你好", "🚀", "Hi café 🚀", "𝄞", "🛀"]) {
      assert.deepEqual(utf16UnitsForText(text), platformUnits(text), `disagreed on ${text}`);
    }
  });

  it("agrees on every code point in the Basic Multilingual Plane", () => {
    for (let codePoint = 0; codePoint <= BMP_MAX; codePoint += 1) {
      if (codePoint >= HIGH_SURROGATE_MIN && codePoint <= LOW_SURROGATE_MAX) continue;
      assert.deepEqual(utf16Units(codePoint), platformUnits(String.fromCodePoint(codePoint)));
    }
  });

  it("agrees across the supplementary planes", () => {
    for (let codePoint = SUPPLEMENTARY_BASE; codePoint <= MAX_CODE_POINT; codePoint += 997) {
      assert.deepEqual(utf16Units(codePoint), platformUnits(String.fromCodePoint(codePoint)));
    }
  });

  it("uses one unit below the ceiling of a single unit and two above it", () => {
    assert.deepEqual(utf16Units(BMP_MAX), [BMP_MAX]);
    assert.equal(utf16Units(SUPPLEMENTARY_BASE)!.length, 2);
  });

  it("refuses a lone surrogate, which is not a character", () => {
    assert.equal(utf16Units(0xd800), null);
    assert.equal(utf16Units(0xdfff), null);
    assert.equal(utf16Units(MAX_CODE_POINT + 1), null);
  });
});

describe("the surrogate patch", () => {
  it("splits a code point into two halves that round-trip", () => {
    for (const codePoint of [0x10000, 0x1f680, 0x1d11e, MAX_CODE_POINT]) {
      const pair = toSurrogatePair(codePoint)!;
      assert.ok(isHighSurrogate(pair.high), `${toHex(pair.high, 4)} is not a high surrogate`);
      assert.ok(isLowSurrogate(pair.low), `${toHex(pair.low, 4)} is not a low surrogate`);
      assert.equal(fromSurrogatePair(pair.high, pair.low), codePoint);
    }
  });

  it("builds the rocket into the pair the lesson asks the learner to produce", () => {
    const pair = toSurrogatePair(0x1f680)!;
    assert.equal(toHex(pair.high, 4), "D83D");
    assert.equal(toHex(pair.low, 4), "DE80");
    assert.equal(pair.offset, 0xf680);
    assert.deepEqual(utf16Units(0x1f680), platformUnits("🚀"));
  });

  it("carries ten bits in each half", () => {
    assert.equal(SURROGATE_BLOCK_SIZE, 1024);
    assert.equal(SURROGATE_BITS, 10);
    assert.equal(2 ** (SURROGATE_BITS * 2), SURROGATE_BLOCK_SIZE * SURROGATE_BLOCK_SIZE);
  });

  it("rejects halves used in the wrong order or on their own", () => {
    const pair = toSurrogatePair(0x1f680)!;
    assert.equal(fromSurrogatePair(pair.low, pair.high), null, "a low surrogate cannot open a pair");
    assert.equal(fromSurrogatePair(pair.high, 0x0041), null);
    assert.equal(toSurrogatePair(0x41), null, "a character that fits in one unit has no pair");
  });
});

describe("Unicode's ceiling is a consequence of that patch", () => {
  it("derives exactly the number Lesson 07 could not explain", () => {
    assert.equal(ceilingFromSurrogates(), MAX_CODE_POINT);
    assert.equal(ceilingFromSurrogates(), 0x10ffff);
    assert.equal(ceilingFromSurrogates(), 1114111);
  });

  it("counts what is left once the surrogate block is spent", () => {
    assert.equal(LOW_SURROGATE_MAX - HIGH_SURROGATE_MIN + 1, 2048, "the whole block is unusable as characters");
    assert.equal(assignableCodePoints(), 1112064);
    assert.ok(assignableCodePoints() < ceilingFromSurrogates() + 1);
  });

  it("would sit somewhere else if the blocks were a different size", () => {
    const oneMoreBit = SUPPLEMENTARY_BASE + (SURROGATE_BLOCK_SIZE * 2) ** 2 - 1;
    assert.notEqual(oneMoreBit, MAX_CODE_POINT, "the ceiling tracks the patch, not the world's characters");
  });
});

describe("byte order only exists when a unit is wider than a byte", () => {
  it("writes the same unit two different ways", () => {
    assert.deepEqual(unitToBytes(0x00e9, 2, "big"), [0x00, 0xe9]);
    assert.deepEqual(unitToBytes(0x00e9, 2, "little"), [0xe9, 0x00]);
  });

  it("turns é into an entirely different code point when read the wrong way round", () => {
    const written = unitToBytes(0x00e9, 2, "little");
    assert.equal(bytesToUnit(written, "big"), 0xe900);
    assert.notEqual(bytesToUnit(written, "big"), 0x00e9);
    assert.equal(bytesToUnit(written, "little"), 0x00e9, "agreeing on the order recovers the character");
  });

  it("leaves a one-byte unit with nothing to disagree about", () => {
    assert.deepEqual(unitToBytes(0x41, 1, "big"), unitToBytes(0x41, 1, "little"));
  });

  it("round-trips a four-byte unit in both orders", () => {
    for (const endianness of ["big", "little"] as const) {
      assert.equal(bytesToUnit(unitToBytes(0x1f680, 4, endianness), endianness), 0x1f680);
    }
  });
});

describe("the sizes the comparison screen claims", () => {
  const cases = [
    { text: "Hello", utf8: 5, utf16: 10, utf32: 20 },
    { text: "Hi café 🚀", utf8: 13, utf16: 20, utf32: 36 },
    { text: "你好", utf8: 6, utf16: 4, utf32: 8 },
    { text: "🚀", utf8: 4, utf16: 4, utf32: 4 },
  ];

  for (const entry of cases) {
    it(`prices ${entry.text} the same way the screen does`, () => {
      assert.equal(encodeText(entry.text).length, entry.utf8);
      assert.equal(utf16ByteLength(entry.text), entry.utf16);
      assert.equal(utf32ByteLength(entry.text), entry.utf32);
    });
  }

  it("lets UTF-16 win somewhere, so the lesson cannot just crown UTF-8", () => {
    assert.ok(utf16ByteLength("你好") < encodeText("你好").length);
    assert.ok(encodeText("Hello").length < utf16ByteLength("Hello"));
    assert.equal(encodeText("🚀").length, utf16ByteLength("🚀"));
  });
});
