import type { ReviewPrompt } from "../types";

export const SHARED_CHARACTER_TABLE_STEPS = [
  "The mismatch",
  "Inspect the rules",
  "Fix every message?",
  "Build one table",
  "Do the numbers matter?",
  "Send a message",
  "Complete",
];

export const SHARED_CHARACTER_TABLE_STORAGE_KEY = "llm-zero:lesson:shared-character-table:v1";

export const SENDER_PRIVATE_TABLE = { A: 12, B: 37, C: 81 } as const;
export const RECEIVER_PRIVATE_TABLE = { A: 54, B: 12, C: 37 } as const;
export const DEFAULT_SHARED_TABLE = { A: 4, B: 9, C: 15 } as const;
export const WEIRD_SHARED_TABLE = { A: 193, B: 7, C: 42 } as const;

export const SHARED_CHARACTER_TABLE_REVIEW: ReviewPrompt[] = [
  {
    id: "l2-shared-rule",
    lessonSlug: "shared-character-table",
    source: "Lesson 02 · Why computers need a shared character table",
    kind: "recall",
    question: "A machine writes down a brand-new rule and sends the number it produces. What is still missing before that number carries a character?",
    principle: "An agreement. A rule written on one side is not shared: the receiver has to hold the same mapping and use it in reverse. Until then the number arrives intact and means nothing.",
  },
];
