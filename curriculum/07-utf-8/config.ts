import type { ReviewPrompt } from "../types";
import { TOY_WIDTH } from "../06-code-points-vs-bytes/config";
import { encodeFixedWidth, minimumWidthFor } from "../06-code-points-vs-bytes/encoding";
import { encodeText } from "./utf8";

export const UTF_8_STEPS = [
  "The bill",
  "Small numbers, small bytes",
  "Where does it start?",
  "The free bit",
  "Tag the bytes",
  "Count the room",
  "Build the rocket",
  "Split the stream",
  "Complete",
];

export const UTF_8_STORAGE_KEY = "llm-zero:lesson:utf-8:v1";

/** The sentence Lesson 04 used to break ASCII, now used to price an encoding. */
export const BILL_TEXT = "Hi café 🚀";
export const BILL_CHARACTERS = Array.from(BILL_TEXT).map((character) => {
  const codePoint = character.codePointAt(0) ?? 0;
  return {
    character,
    label: character === " " ? "space" : character,
    codePoint,
    fixedBytes: encodeFixedWidth(codePoint, TOY_WIDTH) ?? [],
    naiveBytes: minimumWidthFor(codePoint) ?? 1,
  };
});

export const BILL_TOTAL_BYTES = BILL_CHARACTERS.length * TOY_WIDTH;
export const BILL_ZERO_BYTES = BILL_CHARACTERS
  .flatMap((entry) => entry.fixedBytes)
  .filter((byte) => byte === 0).length;
export const BILL_NAIVE_BYTES = BILL_CHARACTERS.reduce((total, entry) => total + entry.naiveBytes, 0);

/** Four characters spanning the sizes, used to size the naive variable-length rule. */
export const SIZE_EXAMPLES = [
  { id: "latin-a", symbol: "A", notation: "U+0041", codePoint: 65 },
  { id: "e-acute", symbol: "é", notation: "U+00E9", codePoint: 233 },
  { id: "devanagari-na", symbol: "न", notation: "U+0928", codePoint: 2344 },
  { id: "rocket", symbol: "🚀", notation: "U+1F680", codePoint: 128640 },
] as const;

/**
 * न is 2,344, which the base-256 rule writes as 9 × 256 + 40. Sent after A, the
 * three bytes 9 · 40 · 65 read equally well as one character then another, or as
 * three separate ones. That ambiguity is the whole problem this lesson solves.
 */
export const AMBIGUOUS_BYTES = [9, 40, 65];
export const AMBIGUOUS_SPLIT_INDEX = 1;

export const ASCII_MAX = 127;

export const ROCKET = {
  symbol: "🚀",
  notation: "U+1F680",
  decimal: 128640,
  hexDigits: ["1", "F", "6", "8", "0"],
  digitBits: ["0001", "1111", "0110", "1000", "0000"],
  payloadSlices: ["000", "011111", "011010", "000000"],
  bytesHex: ["F0", "9F", "9A", "80"],
  bytesBinary: ["11110000", "10011111", "10011010", "10000000"],
} as const;

export const STREAM_TEXT = BILL_TEXT;
export const STREAM_BYTES = encodeText(STREAM_TEXT);

export const UTF_8_REVIEW: ReviewPrompt[] = [
  {
    id: "l7-count-characters",
    lessonSlug: "utf-8",
    source: "Lesson 07 · Build UTF-8 by hand",
    kind: "construct",
    context: "A UTF-8 stream contains four bytes: F0 9F 9A 80.",
    question: "How many characters is that?",
    answer: "1",
    accepts: ["one"],
    principle: "One. F0 opens with four 1s, which claims four bytes, and the three that follow all start with 10, marking them as continuations. The byte count is written into the first byte, so no separate length is ever sent.",
  },
  {
    id: "l7-ascii-unchanged",
    lessonSlug: "utf-8",
    source: "Lesson 07 · Build UTF-8 by hand",
    kind: "construct",
    context: "UTF-8 writes a one-byte character as 0xxxxxxx, leaving seven free bits.",
    question: "What single byte does it store for the letter A?",
    answer: "65",
    accepts: ["0x41", "01000001"],
    principle: "65 — exactly the value ASCII published, with nothing added. Seven free bits are precisely ASCII's range, so a one-byte UTF-8 character and an ASCII character are the same byte. Every ASCII file ever written is already a valid UTF-8 file, unconverted.",
  },
  {
    id: "l7-resynchronize",
    lessonSlug: "utf-8",
    source: "Lesson 07 · Build UTF-8 by hand",
    kind: "recall",
    question: "A reader joins a UTF-8 stream halfway through, with no idea what came before. How can it still find where the next character begins?",
    principle: "Every continuation byte starts with 10 and no first byte does, so the reader skips bytes beginning 10 until it reaches one that does not — that byte begins a character. The structure lives in the bytes themselves rather than in a length sent alongside them, which is why a damaged or truncated stream costs one character rather than everything after it.",
  },
];
