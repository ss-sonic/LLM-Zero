import type { ReviewPrompt } from "../types";

export const CODE_POINTS_VS_BYTES_STEPS = [
  "The missing bytes",
  "One byte's limit",
  "Invent one equation",
  "Change the rule",
  "Break the agreement",
  "Name the missing idea",
  "One rule, two directions",
  "Count the waste",
  "Complete",
];

export const CODE_POINTS_VS_BYTES_STORAGE_KEY = "llm-zero:lesson:code-points-vs-bytes:v1";

export const ROCKET = {
  symbol: "🚀",
  notation: "U+1F680",
  decimal: 128640,
} as const;

export const LATIN_A = {
  symbol: "A",
  notation: "U+0041",
  decimal: 65,
} as const;

export const TOY_WIDTH = 3;
export const ALTERNATE_WIDTH = 4;
export const BYTE_BASE = 256;
export const COST_TEXT = "CAT";

export const CODE_POINTS_VS_BYTES_REVIEW: ReviewPrompt[] = [
  {
    id: "l6-decode-rocket",
    lessonSlug: "code-points-vs-bytes",
    source: "Lesson 06 · A code point is not a byte",
    kind: "construct",
    context: "Under the lesson's invented rule, N = B₁ × 65,536 + B₂ × 256 + B₃, three bytes arrive: 1, 246, 128.",
    question: "Which code point do they decode to?",
    answer: "128640",
    accepts: ["128,640"],
    principle: "1 × 65,536 + 246 × 256 + 128 = 128,640, which is 🚀 at U+1F680. Decoding is the same single equation as encoding, read in the other direction.",
  },
  {
    id: "l6-encoding-is-a-rule",
    lessonSlug: "code-points-vs-bytes",
    source: "Lesson 06 · A code point is not a byte",
    kind: "recall",
    question: "Both machines know Unicode perfectly and agree the character is U+1F680. Why can the receiver still get it wrong?",
    principle: "Knowing the code point does not determine the bytes. An encoding is a separate agreed rule for turning that identity into bytes and back, and if the two sides use different rules — a different number of byte positions, say — the same bytes are read as a different value.",
  },
];
