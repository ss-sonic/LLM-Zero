import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CEILING,
  CJK_TEXT,
  COMPARISONS,
  COURSE_CHARACTERS,
  PAIR_VALUES,
  ROCKET,
  SAMPLE_TEXT,
  SAMPLE_UTF8_BYTES,
  SINGLE_UNIT_VALUES,
  TARGET_CHARACTER_INDEX,
  UTF32_TARGET_BYTE,
  UTF8_TARGET_BYTE,
  UTF_ENCODINGS_STEPS,
} from "../../curriculum/08-utf-encodings/config";
import {
  HIGH_SURROGATE_MIN,
  LOW_SURROGATE_MIN,
  toHex,
  utf16ByteLength,
} from "../../curriculum/08-utf-encodings/encodings";
import { MAX_CODE_POINT, encodeText } from "../../curriculum/07-utf-8/utf8";

/**
 * The screens state numbers. These keep the copy honest against the computation,
 * the same way Lesson 07's do.
 */
describe("Lesson 08 — the numbers the screens claim", () => {
  it("puts the target character where step 2 says, under each encoding", () => {
    assert.equal(TARGET_CHARACTER_INDEX, 9);
    assert.equal(UTF32_TARGET_BYTE, (TARGET_CHARACTER_INDEX - 1) * 4 + 1);
    assert.equal(UTF32_TARGET_BYTE, 33);
    assert.equal(UTF8_TARGET_BYTE, 10);
    assert.notEqual(UTF8_TARGET_BYTE, UTF32_TARGET_BYTE, "the screen's whole point is that they differ");
    assert.equal(SAMPLE_UTF8_BYTES.length, 13);
  });

  it("breaks the 16-bit bet on a character the learner built by hand", () => {
    const overflowing = COURSE_CHARACTERS.filter((entry) => !entry.fitsInOneUnit);
    assert.equal(overflowing.length, 1, "exactly one of the course's characters should overflow");
    assert.equal(overflowing[0].symbol, "🚀");
    assert.equal(overflowing[0].codePoint, ROCKET.decimal, "and it is the one Lesson 07 encoded");
    assert.ok(COURSE_CHARACTERS.filter((entry) => entry.fitsInOneUnit).length >= 3, "most must fit, or the bet looks foolish");
  });

  it("derives the ceiling from the patch, not from a quoted constant", () => {
    assert.equal(SINGLE_UNIT_VALUES, 65536);
    assert.equal(PAIR_VALUES, 1048576);
    assert.equal(SINGLE_UNIT_VALUES + PAIR_VALUES - 1, CEILING);
    assert.equal(CEILING, MAX_CODE_POINT, "Lesson 07's ceiling and Lesson 08's derivation must be the same number");
    assert.equal(toHex(CEILING, 4), "10FFFF");
  });

  it("builds the surrogate pair step 7 walks the learner through", () => {
    assert.equal(ROCKET.symbol.codePointAt(0), ROCKET.decimal);
    assert.equal(ROCKET.offsetHex, "F680");
    assert.equal(ROCKET.offsetBits.length, 20);
    assert.equal(ROCKET.highBits + ROCKET.lowBits, ROCKET.offsetBits, "the halves must be the offset, uncut and unreordered");
    assert.equal(ROCKET.highBits.length, 10);
    assert.equal(ROCKET.lowBits.length, 10);
    assert.equal(parseInt(ROCKET.highBits, 2), ROCKET.highValue);
    assert.equal(parseInt(ROCKET.lowBits, 2), ROCKET.lowValue);
    assert.equal(HIGH_SURROGATE_MIN + ROCKET.highValue, ROCKET.highUnit);
    assert.equal(LOW_SURROGATE_MIN + ROCKET.lowValue, ROCKET.lowUnit);
    assert.equal(toHex(ROCKET.highUnit, 4), "D83D");
    assert.equal(toHex(ROCKET.lowUnit, 4), "DE80");
  });

  it("agrees with the runtime about that pair", () => {
    assert.equal("🚀".charCodeAt(0), ROCKET.highUnit);
    assert.equal("🚀".charCodeAt(1), ROCKET.lowUnit);
  });

  it("gives step 8 a string where UTF-16 genuinely wins", () => {
    assert.ok(utf16ByteLength(CJK_TEXT) < encodeText(CJK_TEXT).length, "the comparison must be losable for UTF-8");
    const cjk = COMPARISONS.find((entry) => entry.text === CJK_TEXT)!;
    assert.equal(cjk.utf8, 6);
    assert.equal(cjk.utf16, 4);
  });

  it("keeps the comparison table varied enough to be worth reading", () => {
    const winners = new Set(COMPARISONS.map((entry) => {
      const best = Math.min(entry.utf8, entry.utf16, entry.utf32);
      return [entry.utf8, entry.utf16, entry.utf32].filter((value) => value === best).length > 1 ? "tie" : best === entry.utf8 ? "utf8" : "utf16";
    }));
    assert.ok(winners.has("utf8") && winners.has("utf16"), "each encoding must win somewhere in the table");
    assert.deepEqual(
      COMPARISONS.map((entry) => [entry.utf8, entry.utf16, entry.utf32]),
      COMPARISONS.map((entry) => [encodeText(entry.text).length, utf16ByteLength(entry.text), Array.from(entry.text).length * 4]),
    );
  });

  it("prices the lesson's own sample sentence consistently with Lesson 07", () => {
    const sample = COMPARISONS.find((entry) => entry.text === SAMPLE_TEXT)!;
    assert.equal(sample.utf8, SAMPLE_UTF8_BYTES.length);
    assert.equal(sample.characters, 9);
  });

  it("ends on a completion screen, like every other lesson", () => {
    assert.equal(UTF_ENCODINGS_STEPS.length, 9);
    assert.equal(UTF_ENCODINGS_STEPS.at(-1), "Complete");
  });
});
