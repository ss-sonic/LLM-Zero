import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  MAX_CODE_POINT,
  UTF8_FORMS,
  classifyByte,
  decodeBytes,
  decodeCharacter,
  decodeToText,
  encodeCodePoint,
  encodeText,
  formForCodePoint,
  isScalarValue,
  payloadSlicesFor,
  sequenceLength,
  splitIntoCharacters,
  toHexByte,
  totalPayloadBits,
} from "../../curriculum/07-utf-8/utf8";

const encoder = new TextEncoder();

function platformBytes(text: string) {
  return [...encoder.encode(text)];
}

describe("the form table follows from the tags", () => {
  it("leaves exactly the bits the tags do not take", () => {
    for (const form of UTF8_FORMS) {
      const tagBits = form.leadPrefix.length + (form.bytes - 1) * 2;
      assert.equal(tagBits + totalPayloadBits(form), form.bytes * 8, `${form.bytes}-byte form does not add up to whole bytes`);
    }
    assert.deepEqual(UTF8_FORMS.map(totalPayloadBits), [7, 11, 16, 21]);
  });

  it("writes the byte count as a run of leading ones", () => {
    for (const form of UTF8_FORMS.slice(1)) {
      assert.equal(form.leadPrefix, `${"1".repeat(form.bytes)}0`);
    }
    assert.equal(UTF8_FORMS[0].leadPrefix, "0", "a single byte is ASCII and carries no run at all");
  });

  it("covers every code point exactly once, with no gap and no overlap", () => {
    assert.equal(UTF8_FORMS[0].min, 0);
    assert.equal(UTF8_FORMS.at(-1)!.max, MAX_CODE_POINT);
    for (let index = 1; index < UTF8_FORMS.length; index += 1) {
      assert.equal(UTF8_FORMS[index].min, UTF8_FORMS[index - 1].max + 1);
    }
  });

  it("has room to spare in four bytes, which is why Unicode's ceiling needs its own explanation", () => {
    assert.equal(2 ** 21 > MAX_CODE_POINT, true);
    assert.equal(MAX_CODE_POINT, 1114111);
  });
});

describe("encoding matches the platform's own UTF-8", () => {
  it("agrees on the characters the curriculum uses", () => {
    for (const text of ["A", "C", "T", "é", "न", "你", "🚀", "Hi café 🚀", "CAT", "नमस्ते", "مرحبا"]) {
      assert.deepEqual(encodeText(text), platformBytes(text), `disagreed on ${text}`);
    }
  });

  it("agrees on every code point in the Basic Multilingual Plane", () => {
    for (let codePoint = 0; codePoint <= 0xffff; codePoint += 1) {
      if (!isScalarValue(codePoint)) continue;
      assert.deepEqual(
        encodeCodePoint(codePoint),
        platformBytes(String.fromCodePoint(codePoint)),
        `disagreed at U+${codePoint.toString(16).toUpperCase()}`,
      );
    }
  });

  it("agrees across the supplementary planes", () => {
    for (let codePoint = 0x10000; codePoint <= MAX_CODE_POINT; codePoint += 997) {
      assert.deepEqual(
        encodeCodePoint(codePoint),
        platformBytes(String.fromCodePoint(codePoint)),
        `disagreed at U+${codePoint.toString(16).toUpperCase()}`,
      );
    }
  });

  it("refuses what is not a scalar value", () => {
    assert.equal(encodeCodePoint(0xd800), null, "surrogates are not encodable");
    assert.equal(encodeCodePoint(MAX_CODE_POINT + 1), null);
    assert.equal(encodeCodePoint(-1), null);
    assert.equal(encodeCodePoint(65.5), null);
  });
});

describe("the payoffs the lesson is built on", () => {
  it("leaves ASCII bytes completely untouched", () => {
    for (let codePoint = 0; codePoint <= 127; codePoint += 1) {
      assert.deepEqual(encodeCodePoint(codePoint), [codePoint]);
    }
    assert.deepEqual(encodeText("CAT"), [67, 65, 84], "identical to the ASCII values from Lesson 03");
  });

  it("builds the rocket into the four bytes the hex bridge opened with", () => {
    const bytes = encodeCodePoint(0x1f680)!;
    assert.deepEqual(bytes.map(toHexByte), ["F0", "9F", "9A", "80"]);
    assert.deepEqual(bytes.map((byte) => byte.toString(2).padStart(8, "0")), [
      "11110000", "10011111", "10011010", "10000000",
    ]);
  });

  it("slices the rocket's twenty-one bits the way the screen asks the learner to", () => {
    assert.deepEqual(payloadSlicesFor(0x1f680), ["000", "011111", "011010", "000000"]);
  });

  it("turns the hex bridge's one changed bit into a different character", () => {
    const before = decodeBytes([0xf0, 0x9f, 0x9a, 0x80]);
    const after = decodeBytes([0xf0, 0x9f, 0x9b, 0x80]);
    assert.deepEqual(before, [0x1f680]);
    assert.notDeepEqual(after, before, "one flipped bit must land on another character");
    assert.deepEqual(after, [0x1f6c0]);
  });

  it("picks the form the lesson's worked examples need", () => {
    assert.equal(formForCodePoint(65)!.bytes, 1);
    assert.equal(formForCodePoint(233)!.bytes, 2);
    assert.equal(formForCodePoint(2344)!.bytes, 3);
    assert.equal(formForCodePoint(128640)!.bytes, 4);
  });
});

describe("reading a stream with nothing but the tags", () => {
  it("names each byte's role from its opening bits", () => {
    assert.equal(classifyByte(0b0100_0001), "single");
    assert.equal(classifyByte(0b1000_0000), "continuation");
    assert.equal(classifyByte(0b1100_0011), "lead");
    assert.equal(classifyByte(0b1111_0000), "lead");
    assert.equal(classifyByte(0b1111_1000), "invalid");
    assert.equal(classifyByte(256), "invalid");
  });

  it("reads the byte count off the run of ones", () => {
    assert.equal(sequenceLength(0b0100_0001), 1);
    assert.equal(sequenceLength(0b1100_0011), 2);
    assert.equal(sequenceLength(0b1110_0000), 3);
    assert.equal(sequenceLength(0b1111_0000), 4);
    assert.equal(sequenceLength(0b1000_0000), null, "a continuation byte claims nothing");
  });

  it("splits a mixed message without being told any lengths", () => {
    const bytes = encodeText("Hi café 🚀");
    assert.equal(bytes.length, 13);
    assert.deepEqual(splitIntoCharacters(bytes)!.map((group) => group.length), [1, 1, 1, 1, 1, 1, 2, 1, 4]);
    assert.equal(decodeToText(bytes), "Hi café 🚀");
  });

  it("round-trips every character the curriculum has shown a learner", () => {
    for (const text of ["A", "café", "नमस्ते", "你好", "🚀", "Hi café 🚀"]) {
      assert.equal(decodeToText(encodeText(text)), text);
    }
  });

  it("finds the next character start from anywhere in the stream", () => {
    const bytes = encodeText("Hi café 🚀");
    // Drop into the middle of the rocket and skip continuations to resynchronize.
    let index = 11;
    while (index < bytes.length && classifyByte(bytes[index]) === "continuation") index += 1;
    assert.equal(index, bytes.length, "the rest of the rocket is all continuation bytes");

    let start = 7;
    while (start < bytes.length && classifyByte(bytes[start]) === "continuation") start += 1;
    assert.equal(decodeCharacter(splitIntoCharacters(bytes.slice(start))![0]), " ".codePointAt(0));
  });

  it("rejects a stream that cannot be split", () => {
    assert.equal(splitIntoCharacters([0x80]), null, "a stream cannot open on a continuation byte");
    assert.equal(splitIntoCharacters([0xf0, 0x9f]), null, "a claimed byte count must actually arrive");
    assert.equal(splitIntoCharacters([0xc3, 0x41]), null, "a continuation slot cannot hold an ASCII byte");
    assert.equal(decodeBytes([0xff]), null);
  });

  it("rejects an overlong encoding, which would give one character two spellings", () => {
    // C1 81 spells 65 in two bytes; A already has a one-byte encoding.
    assert.equal(decodeCharacter([0xc1, 0x81]), null);
    assert.deepEqual(decodeBytes([0x41]), [65]);
  });

  it("rejects a sequence that decodes to a surrogate", () => {
    assert.equal(decodeCharacter([0xed, 0xa0, 0x80]), null);
  });
});
