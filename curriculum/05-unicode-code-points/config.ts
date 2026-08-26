import type { ReviewPrompt } from "../types";

export const UNICODE_CODE_POINT_STEPS = [
  "A system for the world",
  "Invent stable identities",
  "Name the idea",
  "Meet Unicode",
  "Read U+ notation",
  "Identity is not storage",
  "Prove the identity layer",
  "Complete",
];

export const UNICODE_CODE_POINT_STORAGE_KEY = "llm-zero:lesson:unicode-code-points:v1";

export const INVENTED_DEFAULT_TABLE = {
  A: 10,
  "é": 274,
  "न": 8000,
  "你": 50000,
  "🚀": 900000,
} as const;

export const UNICODE_EXAMPLES = [
  { id: "latin-a", symbol: "A", name: "LATIN CAPITAL LETTER A", decimal: 65 },
  { id: "e-acute", symbol: "é", name: "LATIN SMALL LETTER E WITH ACUTE", decimal: 233 },
  { id: "devanagari-na", symbol: "न", name: "DEVANAGARI LETTER NA", decimal: 2344 },
  { id: "cjk-ni", symbol: "你", name: "CJK UNIFIED IDEOGRAPH-4F60", decimal: 20320 },
  { id: "rocket", symbol: "🚀", name: "ROCKET", decimal: 128640 },
] as const;

/** The lesson's running example for identity that storage has not yet resolved. */
export const ROCKET_EXAMPLE = { symbol: "\u{1F680}", notation: "U+1F680", decimal: 128640 } as const;

export const WORLD_SYMBOLS = ["A", "é", "Ω", "Ж", "न", "م", "你", "あ", "★", "🚀"] as const;

export const INVENTED_SYMBOLS = ["A", "é", "न", "你", "🚀"] as const;

export const UNICODE_CODE_POINT_REVIEW: ReviewPrompt[] = [
  {
    id: "l5-ascii-carryover",
    lessonSlug: "unicode",
    source: "Lesson 05 · Unicode and code points",
    kind: "construct",
    context: "Unicode's first 128 code points are deliberately identical to ASCII's assignments.",
    question: "What is the Unicode code point for A, as a decimal number?",
    answer: "65",
    accepts: ["U+0041", "0041", "41 hex"],
    principle: "65, the same number ASCII published. Unicode kept those assignments so text that already existed stayed valid — a compatibility decision, not a mathematical necessity.",
  },
  {
    id: "l5-identity-vs-storage",
    lessonSlug: "unicode",
    source: "Lesson 05 · Unicode and code points",
    kind: "recall",
    question: "Unicode says 🚀 is U+1F680. What has that settled, and what has it deliberately left open?",
    principle: "It settles identity: everyone agrees which character that number refers to. It leaves storage open — the code point says nothing about how many bytes are used or what is in them. That is the encoding's job, and 128640 is far too large for a single byte.",
  },
];
