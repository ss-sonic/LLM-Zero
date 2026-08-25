export const BREAK_ASCII_STEPS = [
  "Prove ASCII works",
  "One missing character",
  "Try a private fix",
  "Try the world",
  "Make the table bigger?",
  "Mixed-text challenge",
  "Complete",
];

export const BREAK_ASCII_STORAGE_KEY = "llm-zero:lesson:breaking-ascii:v1";

export const WORLD_SAMPLES = [
  { id: "hindi", label: "Hindi", text: "नमस्ते" },
  { id: "chinese", label: "Chinese", text: "你好" },
  { id: "arabic", label: "Arabic", text: "مرحبا" },
  { id: "emoji", label: "Emoji", text: "🚀" },
] as const;

export const EXPANSION_AREAS = [
  "Accented Latin letters",
  "Greek and Cyrillic",
  "Arabic scripts",
  "South Asian scripts",
  "Chinese, Japanese, Korean",
  "Symbols and emoji",
] as const;

export const MIXED_TEXT = "Hi café 🚀";
