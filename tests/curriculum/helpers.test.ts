import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { BYTE_PLACE_VALUES, bitsToNumber, emptyByte, isBitArray, toBits } from "../../lib/lesson/binary";
import { asciiCode, encodeAscii, printableAscii, toSevenBit } from "../../curriculum/03-ascii/ascii";
import { canAsciiRepresent, isAscii } from "../../curriculum/04-breaking-ascii/ascii";
import { toUnicodeNotation } from "../../curriculum/05-unicode-code-points/unicode";
import { ROCKET_EXAMPLE, UNICODE_EXAMPLES } from "../../curriculum/05-unicode-code-points/config";
import {
  BYTE_MAX,
  byteWeights,
  decodeFixedWidth,
  encodeFixedWidth,
  isByteValue,
  maxValueForWidth,
} from "../../curriculum/06-code-points-vs-bytes/encoding";
import { ROCKET, TOY_WIDTH } from "../../curriculum/06-code-points-vs-bytes/config";
import { bitsToValue, hexDigitToBits, isNibbleBits, nibbleToHex, normalizeHex } from "../../curriculum/06a-hexadecimal/hex";

describe("Lesson 01 — bits", () => {
  it("writes every byte value as eight bits", () => {
    assert.equal(toBits(65).join(""), "01000001");
    assert.equal(toBits(0).join(""), "00000000");
    assert.equal(toBits(255).join(""), "11111111");
  });

  it("round-trips every value a byte can hold", () => {
    for (let value = 0; value <= 255; value += 1) {
      assert.equal(bitsToNumber(toBits(value)), value);
    }
  });

  it("uses powers of two as place values, which is what makes the total determined", () => {
    assert.deepEqual([...BYTE_PLACE_VALUES], [128, 64, 32, 16, 8, 4, 2, 1]);
    assert.equal(BYTE_PLACE_VALUES.reduce((sum, value) => sum + value, 0), 255);
  });

  it("validates restored bit arrays", () => {
    assert.equal(isBitArray(emptyByte()), true);
    assert.equal(isBitArray(["0", "1"]), false);
    assert.equal(isBitArray(["0", "1", "2", "1", "0", "0", "0", "0"]), false);
    assert.equal(isBitArray("01000001"), false);
  });
});

describe("Lesson 03 — ASCII", () => {
  it("uses the published assignments", () => {
    assert.equal(asciiCode("A"), 65);
    assert.equal(asciiCode("C"), 67);
    assert.equal(asciiCode("T"), 84);
    assert.equal(asciiCode("a"), 97);
    assert.equal(asciiCode("0"), 48);
  });

  it("keeps related characters in consecutive ranges, as the lesson claims", () => {
    for (let offset = 0; offset < 26; offset += 1) {
      assert.equal(asciiCode(String.fromCharCode(65 + offset)), 65 + offset);
      assert.equal(asciiCode(String.fromCharCode(97 + offset)), 97 + offset);
    }
  });

  it("has no entry beyond 127", () => {
    assert.equal(asciiCode("é"), null);
    assert.equal(asciiCode("🚀"), null);
  });

  it("reports exactly which characters a message loses", () => {
    assert.deepEqual(encodeAscii("Hello"), { values: [72, 101, 108, 108, 111], unsupported: [] });
    assert.deepEqual(encodeAscii("café").unsupported, ["é"]);
    assert.deepEqual(encodeAscii("🚀").unsupported, ["🚀"], "an emoji is one character, not two halves");
  });

  it("writes ASCII values in the seven bits the standard actually uses", () => {
    assert.equal(toSevenBit(65), "1000001");
    assert.equal(toSevenBit(127), "1111111");
    assert.equal(printableAscii(32), "space");
    assert.equal(printableAscii(65), "A");
  });
});

describe("Lesson 04 — where ASCII runs out", () => {
  it("agrees with the ASCII table about what is representable", () => {
    assert.equal(isAscii("A"), true);
    assert.equal(isAscii("é"), false);
    assert.equal(canAsciiRepresent("Hello world"), true);
    assert.equal(canAsciiRepresent("नमस्ते"), false);
  });
});

describe("Lesson 05 — code point notation", () => {
  it("writes U+ notation with at least four hex digits", () => {
    assert.equal(toUnicodeNotation(65), "U+0041");
    assert.equal(toUnicodeNotation(233), "U+00E9");
    assert.equal(toUnicodeNotation(2344), "U+0928");
    assert.equal(toUnicodeNotation(20320), "U+4F60");
    assert.equal(toUnicodeNotation(128640), "U+1F680");
  });

  it("keeps the lesson's running example in step with the table it came from", () => {
    const rocket = UNICODE_EXAMPLES.find((example) => example.id === "rocket")!;
    assert.equal(ROCKET_EXAMPLE.symbol, rocket.symbol);
    assert.equal(ROCKET_EXAMPLE.decimal, rocket.decimal);
    assert.equal(ROCKET_EXAMPLE.notation, toUnicodeNotation(rocket.decimal));
  });

  it("matches what the runtime says the character's code point is", () => {
    for (const [symbol, decimal] of [["A", 65], ["é", 233], ["न", 2344], ["你", 20320], ["🚀", 128640]] as const) {
      assert.equal(symbol.codePointAt(0), decimal);
    }
  });
});

describe("Lesson 06 — the invented fixed-width encoding", () => {
  it("uses base-256 place values", () => {
    assert.deepEqual(byteWeights(3), [65536, 256, 1]);
    assert.equal(maxValueForWidth(1), BYTE_MAX);
    assert.equal(maxValueForWidth(3), 16777215);
  });

  it("encodes and decodes the rocket the lesson builds by hand", () => {
    const bytes = encodeFixedWidth(ROCKET.decimal, TOY_WIDTH);
    assert.deepEqual(bytes, [1, 246, 128]);
    assert.equal(decodeFixedWidth(bytes!), ROCKET.decimal);
    assert.equal(1 * 65536 + 246 * 256 + 128, ROCKET.decimal, "the equation shown on screen must be the one that runs");
  });

  it("round-trips every width the lesson uses", () => {
    for (const width of [1, 2, 3, 4]) {
      for (const value of [0, 1, 65, 255, 256, 128640, maxValueForWidth(width)]) {
        const bytes = encodeFixedWidth(value, width);
        if (value > maxValueForWidth(width)) {
          assert.equal(bytes, null);
          continue;
        }
        assert.equal(bytes!.length, width);
        assert.equal(decodeFixedWidth(bytes!), value);
        assert.ok(bytes!.every(isByteValue), "every position must fit in one byte");
      }
    }
  });

  it("refuses values a width cannot hold, which is the whole point of the byte-limit screen", () => {
    assert.equal(encodeFixedWidth(256, 1), null);
    assert.equal(encodeFixedWidth(-1, 3), null);
    assert.equal(encodeFixedWidth(1.5, 3), null);
    assert.equal(isByteValue(255), true);
    assert.equal(isByteValue(256), false);
  });
});

describe("Foundation bridge — hexadecimal", () => {
  it("names all sixteen four-bit patterns", () => {
    const seen = new Set<string>();
    for (let value = 0; value < 16; value += 1) {
      const bits = value.toString(2).padStart(4, "0").split("");
      const digit = nibbleToHex(bits);
      assert.equal(bitsToValue(bits), value);
      seen.add(digit);
    }
    assert.equal(seen.size, 16, "sixteen patterns need sixteen distinct digits");
  });

  it("round-trips every hex digit back to the same four bits", () => {
    for (const digit of "0123456789ABCDEF") {
      const bits = hexDigitToBits(digit);
      assert.equal(nibbleToHex(bits!.split("")), digit);
    }
  });

  it("accepts lowercase input without changing the value", () => {
    assert.equal(hexDigitToBits("f"), "1111");
    assert.equal(normalizeHex(" f6 "), "F6");
    assert.equal(hexDigitToBits("G"), null);
  });

  it("compresses a byte to exactly two digits without losing anything", () => {
    for (let value = 0; value <= 255; value += 1) {
      const bits = value.toString(2).padStart(8, "0");
      const hex = nibbleToHex(bits.slice(0, 4).split("")) + nibbleToHex(bits.slice(4).split(""));
      assert.equal(hex, value.toString(16).toUpperCase().padStart(2, "0"));
      assert.equal(parseInt(hex, 16), value, "hex is notation, not a different value");
    }
  });

  it("validates restored nibbles", () => {
    assert.equal(isNibbleBits(["1", "0", "1", "0"]), true);
    assert.equal(isNibbleBits(["1", "0", "1"]), false);
    assert.equal(isNibbleBits(null), false);
  });
});
