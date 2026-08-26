import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  AMBIGUOUS_BYTES,
  AMBIGUOUS_SPLIT_INDEX,
  ASCII_MAX,
  BILL_CHARACTERS,
  BILL_NAIVE_BYTES,
  BILL_TEXT,
  BILL_TOTAL_BYTES,
  BILL_ZERO_BYTES,
  ROCKET,
  SIZE_EXAMPLES,
  STREAM_BYTES,
  UTF_8_STEPS,
} from "../../curriculum/07-utf-8/config";
import { minimumWidthFor } from "../../curriculum/06-code-points-vs-bytes/encoding";
import { asciiCode } from "../../curriculum/03-ascii/ascii";
import {
  UTF8_FORMS,
  classifyByte,
  encodeCodePoint,
  encodeText,
  payloadSlicesFor,
  toHexByte,
} from "../../curriculum/07-utf-8/utf8";

/**
 * The lesson states numbers on screen. These lock the copy to the computation, so
 * a change to the example sentence cannot quietly leave the prose lying.
 */
describe("Lesson 07 — the numbers the screens claim", () => {
  it("prices the fixed-width bill exactly as step 1 says", () => {
    assert.equal(BILL_CHARACTERS.length, 9);
    assert.equal(BILL_TOTAL_BYTES, 27);
    assert.equal(BILL_ZERO_BYTES, 16);
    assert.ok(BILL_ZERO_BYTES / BILL_TOTAL_BYTES > 0.5, "the screen claims most of the message is padding");
  });

  it("drops to the byte count step 2 promises", () => {
    assert.equal(BILL_NAIVE_BYTES, 11);
    assert.equal(
      BILL_NAIVE_BYTES,
      BILL_CHARACTERS.reduce((total, entry) => total + (minimumWidthFor(entry.codePoint) ?? 1), 0),
    );
  });

  it("sizes step 2's four examples the way the check expects", () => {
    assert.deepEqual(SIZE_EXAMPLES.map((example) => minimumWidthFor(example.codePoint)), [1, 1, 2, 3]);
    for (const example of SIZE_EXAMPLES) {
      assert.equal(example.symbol.codePointAt(0), example.codePoint, `${example.symbol} is mislabelled`);
    }
  });

  it("keeps step 3's ambiguity genuinely ambiguous", () => {
    const read = (splits: boolean[]) => {
      const groups: number[][] = [];
      let current: number[] = [];
      AMBIGUOUS_BYTES.forEach((byte, index) => {
        current.push(byte);
        if (index === AMBIGUOUS_BYTES.length - 1 || splits[index]) { groups.push(current); current = []; }
      });
      return groups.map((group) => group.reduce((total, byte) => total * 256 + byte, 0));
    };

    const intended = read(AMBIGUOUS_BYTES.slice(0, -1).map((_, index) => index === AMBIGUOUS_SPLIT_INDEX));
    assert.deepEqual(intended, [2344, 65], "the sender meant न then A");
    assert.deepEqual(read([true, true]), [9, 40, 65], "cutting every byte apart is equally legal");
    assert.equal(new Set([
      JSON.stringify(read([false, false])),
      JSON.stringify(read([true, false])),
      JSON.stringify(read([false, true])),
      JSON.stringify(read([true, true])),
    ]).size, 4, "the screen claims three bytes can be cut four different ways");
  });

  it("retrieves the ASCII ceiling step 4 is built on", () => {
    assert.equal(ASCII_MAX, 127);
    assert.equal(asciiCode("\u007F"), ASCII_MAX);
    assert.equal(asciiCode("\u0080"), null, "128 is outside the published table");
    assert.equal(ASCII_MAX.toString(2).length, 7, "seven bits, which is why the eighth is free");
    assert.equal(UTF8_FORMS[0].max, ASCII_MAX, "the one-byte form is exactly ASCII's range");
  });

  it("builds the rocket from the digits step 7 hands the learner", () => {
    assert.equal(ROCKET.symbol.codePointAt(0), ROCKET.decimal);
    assert.equal(ROCKET.hexDigits.join(""), ROCKET.decimal.toString(16).toUpperCase());
    assert.deepEqual(
      ROCKET.digitBits,
      ROCKET.hexDigits.map((digit) => parseInt(digit, 16).toString(2).padStart(4, "0")),
    );
    assert.deepEqual([...ROCKET.payloadSlices], payloadSlicesFor(ROCKET.decimal));
    assert.deepEqual([...ROCKET.bytesHex], encodeCodePoint(ROCKET.decimal)!.map(toHexByte));
    assert.deepEqual(
      [...ROCKET.bytesBinary],
      encodeCodePoint(ROCKET.decimal)!.map((byte) => byte.toString(2).padStart(8, "0")),
    );
    assert.equal(ROCKET.digitBits.join("").length, 20, "five hex digits give 20 bits");
    assert.equal(ROCKET.payloadSlices.join("").length, 21, "the four-byte form holds 21, so one zero is prepended");
  });

  it("gives step 8 a stream worth splitting", () => {
    assert.deepEqual(STREAM_BYTES, encodeText(BILL_TEXT));
    assert.equal(STREAM_BYTES.length, 13);
    assert.ok(STREAM_BYTES.length < BILL_TOTAL_BYTES, "UTF-8 must beat the fixed-width bill the lesson opened with");
    const roles = STREAM_BYTES.map(classifyByte);
    assert.ok(
      roles.includes("single") && roles.includes("lead") && roles.includes("continuation"),
      "the stream must exercise all three byte roles",
    );
    assert.notEqual(classifyByte(STREAM_BYTES[0]), "continuation", "a stream cannot open mid-character");
  });

  it("ends on a completion screen, like every other lesson", () => {
    assert.equal(UTF_8_STEPS.length, 9);
    assert.equal(UTF_8_STEPS.at(-1), "Complete");
  });
});
