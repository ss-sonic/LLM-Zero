import type { ReviewPrompt } from "../types";

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

export const BREAK_ASCII_REVIEW: ReviewPrompt[] = [
  {
    id: "l4-private-patch",
    lessonSlug: "breaking-ascii",
    source: "Lesson 04 · Break ASCII",
    kind: "recall",
    question: "A character you need is missing from the standard, and you can edit your own machine's table right now. Why does that not fix it?",
    principle: "Adding an entry on one machine invents a private rule, not an agreement. The number arrives at a receiver that has no entry for it, so the character cannot be recovered. Coverage has to be fixed in the shared standard, not locally.",
  },
];
