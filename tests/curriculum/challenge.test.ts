import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CHALLENGE_REVIEW,
  CHALLENGE_STEPS,
  CHARACTER_DATABASE,
  DECODE_BYTES,
  DECODE_CHARACTERS,
  DECODE_FIRST,
  DECODE_LAST,
  DECODE_TEXT,
  HAND_BUILD,
  MOJIBAKE,
  PRIOR_SENTENCE,
  PRIOR_SENTENCE_BYTES,
  PRIOR_SENTENCE_CHARACTERS,
  SENTENCE,
  SENTENCE_CHARACTERS,
  SENTENCE_HEX,
  SENTENCE_TOTALS,
} from "../../curriculum/09-text-pipeline-challenge/config";
import {
  PIPELINE_ORDER,
  SCRAMBLED_STAGE_IDS,
  chooseCharacter,
  codePointMatches,
  describeCharacter,
  firstOutOfPlace,
  hexBytesMatch,
  isPipelineComplete,
  readAsLatin1,
  sentenceTotals,
} from "../../curriculum/09-text-pipeline-challenge/pipeline";
import { ASCII_BOUNDARY_SAMPLES } from "../../curriculum/03-ascii/config";
import { UTF8_FORMS, decodeToText, encodeText, splitIntoCharacters } from "../../curriculum/07-utf-8/utf8";
import { utf16UnitsForText } from "../../curriculum/08-utf-encodings/encodings";
import { isConstructAnswerCorrect } from "../../curriculum/review";

const encoder = new TextEncoder();
const platformBytes = (text: string) => [...encoder.encode(text)];

/**
 * The challenge prints numbers on nearly every screen, and it is the only thing
 * in the curriculum whose numbers come from composing four lessons' helpers. If
 * any of those helpers drifts, the copy here starts lying quietly — so every
 * claim is locked to the computation, and the computation is locked to the
 * platform's own encoder wherever an oracle exists.
 */
describe("Challenge — the sentence", () => {
  it("is nine characters and seventeen bytes, exactly as the platform encodes it", () => {
    assert.equal(SENTENCE_TOTALS.characters, 9);
    assert.equal(SENTENCE_TOTALS.utf8, 17);
    assert.deepEqual(SENTENCE_CHARACTERS.flatMap((entry) => entry.utf8Bytes), platformBytes(SENTENCE));
    assert.equal(SENTENCE_HEX.length, SENTENCE_TOTALS.utf8);
  });

  it("carries exactly one é, as a single code point rather than a combining pair", () => {
    assert.equal(Array.from(SENTENCE).length, 9, "a decomposed é would make this ten");
    assert.ok(SENTENCE_CHARACTERS.some((entry) => entry.codePoint === 0x00e9));
    assert.equal(SENTENCE.normalize("NFC"), SENTENCE, "the sentence must already be composed");
  });

  it("exercises all four UTF-8 forms, which the course's own example never did", () => {
    const widths = new Set(SENTENCE_CHARACTERS.map((entry) => entry.utf8Length));
    assert.deepEqual([...widths].sort(), UTF8_FORMS.map((form) => form.bytes));
    const priorWidths = new Set(Array.from(PRIOR_SENTENCE).map((character) => encodeText(character).length));
    assert.ok(!priorWidths.has(3), "the whole reason for a new sentence is that Lesson 07's has no three-byte character");
  });

  it("is built from the strings Lesson 03 used to break ASCII", () => {
    const samples: string[] = ASCII_BOUNDARY_SAMPLES.map((sample) => sample.text);
    for (const piece of ["café", "你好", "🚀"]) {
      assert.ok(samples.includes(piece), `${piece} is not one of the strings that broke ASCII`);
      assert.ok(SENTENCE.includes(piece), `${piece} is missing from the challenge sentence`);
    }
  });

  it("makes step 1's wager worth making: same character count, different bill", () => {
    assert.equal(PRIOR_SENTENCE_CHARACTERS, SENTENCE_TOTALS.characters, "the wager needs both sentences to be the same length");
    assert.notEqual(PRIOR_SENTENCE_BYTES, SENTENCE_TOTALS.utf8, "and it needs them to cost differently");
    assert.equal(SENTENCE_TOTALS.utf8 - PRIOR_SENTENCE_BYTES, 4, "step 4 claims the swap costs four more bytes");
  });

  it("splits into the byte distribution step 4's nudge states", () => {
    const counts = SENTENCE_CHARACTERS.reduce<Record<number, number>>((totals, entry) => {
      totals[entry.utf8Length] = (totals[entry.utf8Length] ?? 0) + 1;
      return totals;
    }, {});
    assert.deepEqual(counts, { 1: 5, 2: 1, 3: 2, 4: 1 });
  });

  it("splits derivable code points from database lookups the way step 3 claims", () => {
    assert.equal(SENTENCE_CHARACTERS.filter((entry) => entry.isAscii).length, 5);
    assert.equal(CHARACTER_DATABASE.length, 4);
    assert.ok(CHARACTER_DATABASE.every((entry) => !entry.isAscii), "the database must not list what the learner can derive");
    assert.ok(CHARACTER_DATABASE.every((entry) => entry.name !== "UNNAMED"), "every looked-up character needs its Unicode name");
  });
});

describe("Challenge — the pipeline the learner rebuilds", () => {
  it("scrambles the stages without losing or inventing one", () => {
    assert.deepEqual([...SCRAMBLED_STAGE_IDS].sort(), [...PIPELINE_ORDER].sort());
    assert.notDeepEqual(SCRAMBLED_STAGE_IDS, PIPELINE_ORDER, "the puzzle must not start solved");
    assert.notEqual(SCRAMBLED_STAGE_IDS[0], PIPELINE_ORDER[0], "nor hand over the first move");
  });

  it("never treats hexadecimal as a stage, because it is notation", () => {
    assert.ok(!PIPELINE_ORDER.some((id) => id.includes("hex")));
    assert.equal(PIPELINE_ORDER.length, 5);
  });

  it("finds the first misordered position and only accepts the full pipeline", () => {
    assert.equal(firstOutOfPlace(PIPELINE_ORDER), -1);
    assert.equal(isPipelineComplete(PIPELINE_ORDER), true);
    assert.equal(isPipelineComplete(PIPELINE_ORDER.slice(0, 4)), false, "a partial order is not a solution");

    const swapped = [...PIPELINE_ORDER];
    [swapped[2], swapped[3]] = [swapped[3], swapped[2]];
    assert.equal(firstOutOfPlace(swapped), 2);
    assert.equal(isPipelineComplete(swapped), false);
  });
});

describe("Challenge — building three bytes by hand", () => {
  it("agrees with the platform about 你", () => {
    assert.equal(HAND_BUILD.codePoint, "你".codePointAt(0));
    assert.equal(HAND_BUILD.notation, "U+4F60");
    assert.deepEqual(HAND_BUILD.utf8Bytes, platformBytes(HAND_BUILD.symbol));
    assert.deepEqual([...HAND_BUILD.utf8Hex], ["E4", "BD", "A0"]);
  });

  it("keeps every intermediate step consistent with the one before it", () => {
    assert.equal(HAND_BUILD.hexDigits.join(""), "4F60");
    assert.equal(HAND_BUILD.digitBits.join(""), HAND_BUILD.payloadBits);
    assert.ok(HAND_BUILD.digitBits.every((bits) => bits.length === 4), "the hexadecimal bridge is four bits a digit");
    assert.equal(HAND_BUILD.payloadBits.length, 16);
    assert.equal(HAND_BUILD.payloadSlices.join(""), HAND_BUILD.payloadBits, "the cut may not drop or reorder a bit");
    assert.deepEqual(HAND_BUILD.payloadSlices.map((slice) => slice.length), [4, 6, 6]);
    assert.deepEqual(
      HAND_BUILD.tags.map((tag, index) => parseInt(`${tag}${HAND_BUILD.payloadSlices[index]}`, 2)),
      [...HAND_BUILD.utf8Bytes],
      "tag plus slice must produce the byte the screen shows",
    );
    assert.deepEqual([...HAND_BUILD.bytesBinary], HAND_BUILD.utf8Bytes.map((byte) => byte.toString(2).padStart(8, "0")));
  });

  it("builds the one form the earlier lessons never made anyone produce", () => {
    assert.equal(HAND_BUILD.utf8Length, 3);
    assert.equal(HAND_BUILD.symbol, "你");
  });
});

describe("Challenge — the other two encodings", () => {
  it("prices the sentence three ways, and lets UTF-8 lose nothing it should win", () => {
    assert.equal(SENTENCE_TOTALS.utf16Units, 10);
    assert.equal(SENTENCE_TOTALS.utf16, 20);
    assert.equal(SENTENCE_TOTALS.utf32, 36);
    assert.equal(SENTENCE_TOTALS.utf16Units, utf16UnitsForText(SENTENCE).length);
    assert.equal(SENTENCE_TOTALS.utf16, SENTENCE_TOTALS.utf16Units * 2);
    assert.equal(SENTENCE_TOTALS.utf32, SENTENCE_TOTALS.characters * 4);
    assert.equal(SENTENCE_TOTALS.utf16 - SENTENCE_TOTALS.utf8, 3, "step 6 claims UTF-8 wins by three");
  });

  it("keeps the unit count different from the character count, which is the trap", () => {
    assert.notEqual(SENTENCE_TOTALS.utf16Units, SENTENCE_TOTALS.characters);
    assert.equal(SENTENCE.length, SENTENCE_TOTALS.utf16Units, "the screen claims a browser reports the unit count");
  });

  it("keeps the explanation of who wins where honest", () => {
    const ascii = SENTENCE_CHARACTERS.filter((entry) => entry.utf8Length === 1);
    const cjk = SENTENCE_CHARACTERS.filter((entry) => entry.utf8Length === 3);
    assert.equal(ascii.length, 5);
    assert.equal(cjk.length, 2);
    assert.ok(ascii.every((entry) => entry.utf8Length < entry.utf16Length), "UTF-8 must win every ASCII character");
    assert.ok(cjk.every((entry) => entry.utf16Length < entry.utf8Length), "and lose every CJK one, or the lesson is not honest");

    const cjkOnly = sentenceTotals(cjk);
    assert.ok(cjkOnly.utf16 < cjkOnly.utf8, "Lesson 08's CJK result must still hold on its own");
  });
});

describe("Challenge — reading bytes back", () => {
  it("hands the learner a stream the platform agrees with", () => {
    assert.deepEqual(DECODE_BYTES, platformBytes(DECODE_TEXT));
    assert.equal(decodeToText(DECODE_BYTES), DECODE_TEXT, "the round trip is the point of the screen");
  });

  it("splits into the number of characters the screen asks for, from tags alone", () => {
    const groups = splitIntoCharacters(DECODE_BYTES);
    assert.ok(groups);
    assert.equal(groups!.length, DECODE_CHARACTERS.length);
    assert.equal(DECODE_CHARACTERS.length, 3);
    assert.notEqual(DECODE_CHARACTERS.length, DECODE_BYTES.length, "a stream where bytes and characters agree teaches nothing");
    assert.deepEqual(groups!.map((group) => group.length), DECODE_CHARACTERS.map((entry) => entry.utf8Length));
  });

  it("asks for one multi-byte code point at each end, not the easy middle one", () => {
    assert.equal(DECODE_FIRST.codePoint, 0x2713);
    assert.equal(DECODE_LAST.codePoint, 0x1f389);
    assert.equal(DECODE_FIRST.utf8Length, 3);
    assert.equal(DECODE_LAST.utf8Length, 4);
    assert.ok(DECODE_CHARACTERS[1].isAscii, "the middle character is the space that proves the split was read, not guessed");
  });
});

describe("Challenge — the diagnosis", () => {
  it("reproduces real mojibake rather than an invented one", () => {
    assert.deepEqual(MOJIBAKE.bytes, platformBytes(MOJIBAKE.text));
    assert.equal(MOJIBAKE.broken, "cafÃ©");
    assert.equal(readAsLatin1(MOJIBAKE.bytes), MOJIBAKE.bytes.map((byte) => String.fromCharCode(byte)).join(""));
  });

  it("keeps the counts the screen states", () => {
    assert.equal(MOJIBAKE.realCharacters, 4);
    assert.equal(MOJIBAKE.brokenCharacters, 5);
    assert.equal(MOJIBAKE.brokenCharacters, MOJIBAKE.bytes.length, "the broken reader makes one character per byte");
    assert.ok(MOJIBAKE.brokenCharacters > MOJIBAKE.realCharacters, "the failure has to be visible as extra characters");
  });

  it("points at a lead byte, not a continuation byte", () => {
    assert.equal(MOJIBAKE.leadByteIndex, 3);
    assert.equal(MOJIBAKE.hex[MOJIBAKE.leadByteIndex], "C3");
    assert.equal(MOJIBAKE.hex[MOJIBAKE.leadByteIndex + 1], "A9");
    assert.equal(MOJIBAKE.bytes[MOJIBAKE.leadByteIndex] >> 6, 0b11, "a lead byte opens with a run of 1s");
    assert.equal(MOJIBAKE.bytes[MOJIBAKE.leadByteIndex + 1] >> 6, 0b10, "and the byte after it is a continuation");
  });
});

describe("Challenge — the learner's own character", () => {
  it("refuses ASCII, empty input and anything unusable", () => {
    assert.deepEqual(chooseCharacter(""), { ok: false, reason: "empty" });
    assert.deepEqual(chooseCharacter("A"), { ok: false, reason: "ascii" });
    assert.deepEqual(chooseCharacter(" "), { ok: false, reason: "ascii" });
    assert.deepEqual(chooseCharacter("\ud800"), { ok: false, reason: "unusable" }, "a lone surrogate is not a character");
  });

  it("accepts a character nobody here chose and encodes it as the platform does", () => {
    for (const symbol of ["ñ", "ॐ", "𝄞", "🎈"]) {
      const result = chooseCharacter(symbol);
      assert.ok(result.ok, `${symbol} should be usable`);
      assert.deepEqual(result.character.utf8Bytes, platformBytes(symbol));
      assert.ok(result.character.utf8Length >= 2, "the screen promises the exercise is never trivial");
    }
  });

  it("takes only the first character when someone pastes a word", () => {
    const result = chooseCharacter("你好");
    assert.ok(result.ok);
    assert.equal(result.character.symbol, "你");
  });

  it("keeps the borrow row outside the course's own examples", () => {
    for (const symbol of ["ñ", "ॐ", "𝄞"]) {
      assert.ok(!SENTENCE.includes(symbol), `${symbol} is already in the challenge sentence`);
      assert.ok(!DECODE_TEXT.includes(symbol), `${symbol} is already in the decode stream`);
    }
  });
});

describe("Challenge — what the inputs accept", () => {
  it("reads a code point as decimal or as notation, and nothing else", () => {
    assert.equal(codePointMatches("233", 233), true);
    assert.equal(codePointMatches("U+00E9", 233), true);
    assert.equal(codePointMatches("u+e9", 233), true);
    assert.equal(codePointMatches("0xE9", 233), true);
    assert.equal(codePointMatches("4F60", 0x4f60), true, "digits with letters can only be hexadecimal");
    assert.equal(codePointMatches("E9", 233), true);
    assert.equal(codePointMatches("41", 65), false, "a bare decimal is read as one, which is what the screen asks for");
    assert.equal(codePointMatches("", 233), false);
    assert.equal(codePointMatches("233x", 233), false);
  });

  it("forgives hex byte formatting but not a different byte", () => {
    assert.equal(hexBytesMatch("E4 BD A0", ["E4", "BD", "A0"]), true);
    assert.equal(hexBytesMatch("e4bda0", ["E4", "BD", "A0"]), true);
    assert.equal(hexBytesMatch("0xE4 0xBD 0xA0", ["E4", "BD", "A0"]), true);
    assert.equal(hexBytesMatch("E4 BD", ["E4", "BD", "A0"]), false);
    assert.equal(hexBytesMatch("E4 BD A1", ["E4", "BD", "A0"]), false);
  });

  it("describes any scalar value and refuses everything else", () => {
    assert.equal(describeCharacter("🚀")?.utf8Length, 4);
    assert.equal(describeCharacter("\udfff"), null);
    assert.equal(describeCharacter(""), null);
  });
});

describe("Challenge — structure and what comes back later", () => {
  it("ends on a completion screen, like every lesson", () => {
    assert.equal(CHALLENGE_STEPS.length, 10);
    assert.equal(CHALLENGE_STEPS.at(-1), "Complete");
  });

  it("asks its review prompts for numbers the challenge actually computes", () => {
    const price = CHALLENGE_REVIEW.find((prompt) => prompt.id === "c1-price-the-sentence")!;
    assert.equal(price.answer, String(SENTENCE_TOTALS.utf8));
    assert.equal(isConstructAnswerCorrect(price, "17 bytes"), true);

    const units = CHALLENGE_REVIEW.find((prompt) => prompt.id === "c1-utf16-units")!;
    assert.equal(units.answer, String(SENTENCE_TOTALS.utf16Units));
    assert.equal(isConstructAnswerCorrect(units, "ten"), true);
    assert.equal(isConstructAnswerCorrect(units, "9"), false);
  });

  it("states in each prompt's context the code points it expects to be used", () => {
    const price = CHALLENGE_REVIEW.find((prompt) => prompt.id === "c1-price-the-sentence")!;
    for (const entry of CHARACTER_DATABASE) {
      assert.ok(price.context?.includes(entry.notation), `${entry.notation} is needed to answer but is not stated`);
    }
  });
});
