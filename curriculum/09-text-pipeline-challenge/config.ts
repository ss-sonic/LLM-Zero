import type { ReviewPrompt } from "../types";
import { ASCII_LANDMARKS } from "../03-ascii/config";
import { UNICODE_EXAMPLES } from "../05-unicode-code-points/config";
import { BILL_TEXT } from "../07-utf-8/config";
import { encodeText, payloadBitsFor, payloadSlicesFor, toBinary, toHexByte } from "../07-utf-8/utf8";
import { utf16UnitsForText } from "../08-utf-encodings/encodings";
import { analyzeSentence, describeCharacter, readAsLatin1, sentenceTotals } from "./pipeline";

export const CHALLENGE_STEPS = [
  "The job",
  "Lay out the pipeline",
  "Symbols to numbers",
  "Price the sentence",
  "Build it by hand",
  "Price it three ways",
  "Read it back",
  "Diagnose the break",
  "Your own character",
  "Complete",
];

export const CHALLENGE_STORAGE_KEY = "llm-zero:lesson:text-pipeline-challenge:v1";

/**
 * The sentence, written with explicit escapes so the é can never arrive here as
 * e + a combining accent. That would be two code points wearing one glyph, and
 * combining marks are a Phase 2 concept the challenge has no business meeting.
 *
 * It is not an arbitrary phrase. `café`, `你好` and `🚀` are three of the five
 * strings Lesson 03 used to prove ASCII could not hold the world's text. The
 * capstone encodes exactly the text that broke the first standard.
 */
export const SENTENCE = "café 你好 \u{1f680}";
export const SENTENCE_CHARACTERS = analyzeSentence(SENTENCE);
export const SENTENCE_TOTALS = sentenceTotals(SENTENCE_CHARACTERS);
export const SENTENCE_BYTES = encodeText(SENTENCE);
export const SENTENCE_HEX = SENTENCE_BYTES.map(toHexByte);
export const SENTENCE_UTF16_UNITS = utf16UnitsForText(SENTENCE);

/**
 * Lesson 07 priced this one, and it has the same number of characters.
 *
 * That coincidence is the wager on step 1: a learner who thinks characters
 * determine bytes has no reason to expect a different answer.
 */
export const PRIOR_SENTENCE = BILL_TEXT;
export const PRIOR_SENTENCE_BYTES = encodeText(PRIOR_SENTENCE).length;
export const PRIOR_SENTENCE_CHARACTERS = Array.from(PRIOR_SENTENCE).length;

/** The ASCII anchors Lesson 03 published, for the code points the learner derives. */
export const ASCII_ANCHORS = ASCII_LANDMARKS.filter((entry) => ["space", "a", "A", "0"].includes(entry.label));

const UNICODE_NAMES: Record<string, string> = {
  ...Object.fromEntries(UNICODE_EXAMPLES.map((example) => [example.symbol, example.name])),
  "好": "CJK UNIFIED IDEOGRAPH-597D",
};

/**
 * What a character database is actually for.
 *
 * Nobody derives 你's code point; they look it up. Knowing which characters you
 * can work out and which you must look up is itself part of the skill, so the
 * ASCII ones are deliberately absent from this table.
 */
export const CHARACTER_DATABASE = SENTENCE_CHARACTERS
  .filter((entry) => !entry.isAscii)
  .map((entry) => ({ ...entry, name: UNICODE_NAMES[entry.symbol] ?? "UNNAMED" }));

/** The one UTF-8 form the curriculum has never made anyone build: three bytes. */
const HAND_BUILD_SYMBOL = "你";
const HAND_BUILD_CHARACTER = describeCharacter(HAND_BUILD_SYMBOL)!;
const HAND_BUILD_HEX = HAND_BUILD_CHARACTER.codePoint.toString(16).toUpperCase();

export const HAND_BUILD = {
  ...HAND_BUILD_CHARACTER,
  hexDigits: HAND_BUILD_HEX.split(""),
  digitBits: HAND_BUILD_HEX.split("").map((digit) => toBinary(parseInt(digit, 16), 4)),
  payloadBits: payloadBitsFor(HAND_BUILD_CHARACTER.codePoint)!,
  payloadSlices: payloadSlicesFor(HAND_BUILD_CHARACTER.codePoint)!,
  bytesBinary: HAND_BUILD_CHARACTER.utf8Bytes.map((byte) => toBinary(byte, 8)),
  tags: ["1110", "10", "10"],
} as const;

/**
 * Step 7 goes the other way, on a stream the learner has never seen. The reward
 * for reading it correctly is what it says.
 */
export const DECODE_TEXT = "✓ \u{1f389}";
export const DECODE_BYTES = encodeText(DECODE_TEXT);
export const DECODE_HEX = DECODE_BYTES.map(toHexByte);
export const DECODE_CHARACTERS = analyzeSentence(DECODE_TEXT);
export const DECODE_FIRST = DECODE_CHARACTERS[0];
export const DECODE_LAST = DECODE_CHARACTERS[DECODE_CHARACTERS.length - 1];

/**
 * The failure every learner has already seen on a web page, using the first four
 * characters of their own sentence.
 */
const MOJIBAKE_TEXT = "café";
const MOJIBAKE_BYTES = encodeText(MOJIBAKE_TEXT);

export const MOJIBAKE = {
  text: MOJIBAKE_TEXT,
  bytes: MOJIBAKE_BYTES,
  hex: MOJIBAKE_BYTES.map(toHexByte),
  broken: readAsLatin1(MOJIBAKE_BYTES),
  realCharacters: Array.from(MOJIBAKE_TEXT).length,
  brokenCharacters: MOJIBAKE_BYTES.length,
  /** The byte the broken reader turns into a character of its own. */
  leadByteIndex: MOJIBAKE_BYTES.findIndex((byte) => byte >= 0b1100_0000),
} as const;

export const CHALLENGE_REVIEW: ReviewPrompt[] = [
  {
    id: "c1-price-the-sentence",
    lessonSlug: "text-pipeline-challenge",
    source: "Challenge · Symbols to bytes",
    kind: "construct",
    context: "café 你好 🚀 is nine characters. é is U+00E9, 你 is U+4F60, 好 is U+597D, and 🚀 is U+1F680.",
    question: "How many bytes does UTF-8 need for it?",
    answer: "17",
    accepts: ["17 bytes"],
    principle: "Seventeen. Four ASCII characters and two spaces cost one byte each, é costs two, 你 and 好 cost three each because they sit above U+07FF, and 🚀 costs four. Nine characters, seventeen bytes — the character count never determined the byte count.",
  },
  {
    id: "c1-utf16-units",
    lessonSlug: "text-pipeline-challenge",
    source: "Challenge · Symbols to bytes",
    kind: "construct",
    context: "café 你好 🚀 is nine characters, and only 🚀 sits above U+FFFF.",
    question: "How many 16-bit units does UTF-16 need for it?",
    answer: "10",
    accepts: ["ten", "10 units"],
    principle: "Ten. Eight of the nine characters take one unit each; 🚀 is above U+FFFF so it takes a surrogate pair. That is 20 bytes against UTF-8's 17 for the same sentence, and it is exactly what a browser means when it reports this string's length as 10 rather than 9.",
  },
  {
    id: "c1-mojibake",
    lessonSlug: "text-pipeline-challenge",
    source: "Challenge · Symbols to bytes",
    kind: "recall",
    question: "A file that should read café opens as cafÃ© instead. The bytes on disk are correct UTF-8 and nothing about them is damaged. So what went wrong?",
    principle: "The reader was never told which encoding the bytes were in, and assumed one byte per character. In UTF-8 the two bytes C3 A9 are one character, é; under a one-byte rule they are two, Ã and ©. Bytes carry no label saying what they are, so sender and reader have to agree in advance — which is Lesson 02's disagreement, one level further down.",
  },
];
