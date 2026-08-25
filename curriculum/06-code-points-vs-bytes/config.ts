export const CODE_POINTS_VS_BYTES_STEPS = [
  "Identity is not storage",
  "What one byte holds",
  "Spend more bytes",
  "Is that sequence forced?",
  "Break it again",
  "Name the idea",
  "Encode and decode",
  "Count the cost",
  "Complete",
];

export const CODE_POINTS_VS_BYTES_STORAGE_KEY = "llm-zero:lesson:code-points-vs-bytes:v1";

export const ROCKET = { symbol: "🚀", notation: "U+1F680", codePoint: 128640 } as const;
export const LATIN_A = { symbol: "A", notation: "U+0041", codePoint: 65 } as const;

/**
 * The lesson's invented encoding. Three byte positions, most significant first —
 * base-256 positional notation, the same idea as binary one layer up. It is
 * deliberately NOT a Unicode encoding: the point is that the rule is a choice.
 */
export const TOY_WIDTH = 3;
export const TOY_RULE_NAME = "Fixed-3";

/** Widths the learner can compare on the "is that sequence forced?" screen. */
export const WIDTH_OPTIONS = [2, 3, 4] as const;

/** The string whose storage cost exposes why a fixed width is wasteful. */
export const COST_TEXT = "CAT";

/** Sender uses Fixed-3; the receiver insists on four-byte groups. */
export const MISMATCH_TEXT = "A🚀";
export const RECEIVER_WIDTH = 4;
