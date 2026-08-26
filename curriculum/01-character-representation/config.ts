import type { ReviewPrompt } from "../types";

export const CHARACTER_REPRESENTATION_STEPS = [
  "The mystery",
  "Invent a rule",
  "Is the number special?",
  "Break the agreement",
  "See the bits",
  "Prove the idea",
  "Complete",
];

// Keep the original key so existing learners do not lose Lesson 01 progress
// during the architecture migration.
export const CHARACTER_REPRESENTATION_STORAGE_KEY = "llm-zero:lesson-01:v1";

export const CHARACTER_REPRESENTATION_REVIEW: ReviewPrompt[] = [
  {
    id: "l1-stored-bits",
    lessonSlug: "character-representation",
    source: "Lesson 01 · How computers represent text",
    kind: "construct",
    context: "A machine uses the rule A → 65.",
    question: "Write the eight bits it stores for A.",
    answer: "01000001",
    principle: "65 = 64 + 1, so the places worth 64 and 1 are on and every other place is off: 01000001. The mapping A → 65 was a human decision; turning 65 into those bits is positional arithmetic and is not.",
  },
  {
    id: "l1-nothing-inside",
    lessonSlug: "character-representation",
    source: "Lesson 01 · How computers represent text",
    kind: "recall",
    question: "Two machines hold the identical byte in memory, and one displays A while the other displays Z. How is that possible?",
    principle: "Nothing about a character is stored in the byte. The byte is a representation, and each machine applies its own rule to decide which character that representation stands for. Change the rule and the same bits read as a different character.",
  },
];
