import type { ReviewPrompt } from "../types";
import { UNICODE_EXAMPLES } from "../05-unicode-code-points/config";
import { encodeText } from "../07-utf-8/utf8";
import {
  BMP_MAX,
  HIGH_SURROGATE_MIN,
  LOW_SURROGATE_MIN,
  SURROGATE_BLOCK_SIZE,
  SUPPLEMENTARY_BASE,
  ceilingFromSurrogates,
  toSurrogatePair,
  utf16ByteLength,
  utf32ByteLength,
} from "./encodings";

export const UTF_ENCODINGS_STEPS = [
  "Make the bet",
  "What fixed width buys",
  "The bet loses",
  "The patch",
  "The ceiling",
  "Which byte first?",
  "Build the rocket again",
  "Which would you use?",
  "Complete",
];

export const UTF_ENCODINGS_STORAGE_KEY = "llm-zero:lesson:utf-encodings:v1";

/** The same sentence Lesson 07 priced, now priced three ways. */
export const SAMPLE_TEXT = "Hi café 🚀";
export const SAMPLE_CHARACTERS = Array.from(SAMPLE_TEXT);
export const SAMPLE_UTF8_BYTES = encodeText(SAMPLE_TEXT);

/** Character 9 is the rocket — the last one, and the one furthest into the stream. */
export const TARGET_CHARACTER_INDEX = SAMPLE_CHARACTERS.length;
export const UTF32_TARGET_BYTE = (TARGET_CHARACTER_INDEX - 1) * 4 + 1;
export const UTF8_TARGET_BYTE = SAMPLE_CHARACTERS
  .slice(0, TARGET_CHARACTER_INDEX - 1)
  .reduce((total, character) => total + encodeText(character).length, 0) + 1;

/** The characters the learner has actually met, used to break the 16-bit bet. */
export const COURSE_CHARACTERS = UNICODE_EXAMPLES.map((example) => ({
  id: example.id,
  symbol: example.symbol,
  name: example.name,
  codePoint: example.decimal,
  fitsInOneUnit: example.decimal <= BMP_MAX,
}));

export const SINGLE_UNIT_VALUES = BMP_MAX + 1;
export const PAIR_VALUES = SURROGATE_BLOCK_SIZE * SURROGATE_BLOCK_SIZE;
export const CEILING = ceilingFromSurrogates();

const ROCKET_CODE_POINT = 0x1f680;
const ROCKET_PAIR = toSurrogatePair(ROCKET_CODE_POINT)!;

export const ROCKET = {
  symbol: "🚀",
  notation: "U+1F680",
  decimal: ROCKET_CODE_POINT,
  offsetHex: ROCKET_PAIR.offset.toString(16).toUpperCase(),
  offsetBits: ROCKET_PAIR.offset.toString(2).padStart(20, "0"),
  highBits: ROCKET_PAIR.offset.toString(2).padStart(20, "0").slice(0, 10),
  lowBits: ROCKET_PAIR.offset.toString(2).padStart(20, "0").slice(10),
  highValue: ROCKET_PAIR.high - HIGH_SURROGATE_MIN,
  lowValue: ROCKET_PAIR.low - LOW_SURROGATE_MIN,
  highUnit: ROCKET_PAIR.high,
  lowUnit: ROCKET_PAIR.low,
} as const;

/** é is one 16-bit unit, so it is the smallest honest demonstration of byte order. */
export const ORDER_EXAMPLE = {
  symbol: "é",
  notation: "U+00E9",
  unit: 0x00e9,
  bytes: [0x00, 0xe9],
  reversedUnit: 0xe900,
} as const;

export const COMPARISONS = ["Hello", SAMPLE_TEXT, "你好", "🚀"].map((text) => ({
  text,
  characters: Array.from(text).length,
  utf8: encodeText(text).length,
  utf16: utf16ByteLength(text),
  utf32: utf32ByteLength(text),
}));

/** The screen asks the learner to price this one themselves. */
export const CJK_TEXT = "你好";

export const SUPPLEMENTARY_START = SUPPLEMENTARY_BASE;
export const HIGH_BLOCK_START = HIGH_SURROGATE_MIN;
export const LOW_BLOCK_START = LOW_SURROGATE_MIN;

export const UTF_ENCODINGS_REVIEW: ReviewPrompt[] = [
  {
    id: "l8-ceiling",
    lessonSlug: "utf-encodings",
    source: "Lesson 08 · UTF-8 vs UTF-16 vs UTF-32",
    kind: "construct",
    context: "A 16-bit unit reaches 65,536 values on its own, and a reserved pair adds one value from each of two 1,024-entry blocks.",
    question: "How many code points can that reach in total?",
    answer: "1114112",
    accepts: ["1,114,112", "1048576+65536", "1114111+1"],
    principle: "65,536 + (1,024 × 1,024) = 1,114,112 values, so the highest is U+10FFFF — 1,114,111. Unicode's ceiling is the size of UTF-16's compatibility patch, not a judgement about how many characters the world needs.",
  },
  {
    id: "l8-byte-order",
    lessonSlug: "utf-encodings",
    source: "Lesson 08 · UTF-8 vs UTF-16 vs UTF-32",
    kind: "recall",
    question: "UTF-16 and UTF-32 both have to declare which byte of a unit comes first. Why does UTF-8 never have to?",
    principle: "Because a UTF-8 unit is a single byte, and there is only one way to order one byte. UTF-16's unit is two bytes and UTF-32's is four, so two machines can write the same unit in opposite orders and each read the other's text as different characters — which is Lesson 02's problem again, one level down.",
  },
  {
    id: "l8-when-utf16-wins",
    lessonSlug: "utf-encodings",
    source: "Lesson 08 · UTF-8 vs UTF-16 vs UTF-32",
    kind: "construct",
    context: "你好 is two characters, both between U+0800 and U+FFFF.",
    question: "How many bytes is it in UTF-8, and how many in UTF-16?",
    answer: "6 and 4",
    accepts: ["6, 4", "6 4", "utf-8 6 utf-16 4"],
    principle: "Six in UTF-8 — that range costs three bytes each — and four in UTF-16, one two-byte unit each. UTF-8 is not smaller for everything. It wins decisively on ASCII-heavy text and loses to UTF-16 across most of the CJK range.",
  },
];
