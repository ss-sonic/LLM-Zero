import type { ReviewPrompt } from "./types";
import { CHARACTER_REPRESENTATION_REVIEW } from "./01-character-representation/config";
import { SHARED_CHARACTER_TABLE_REVIEW } from "./02-shared-character-table/config";
import { ASCII_REVIEW } from "./03-ascii/config";
import { BREAK_ASCII_REVIEW } from "./04-breaking-ascii/config";
import { UNICODE_CODE_POINT_REVIEW } from "./05-unicode-code-points/config";
import { CODE_POINTS_VS_BYTES_REVIEW } from "./06-code-points-vs-bytes/config";
import { HEXADECIMAL_BRIDGE_REVIEW } from "./06a-hexadecimal/config";
import { UTF_8_REVIEW } from "./07-utf-8/config";

export type { ReviewPrompt } from "./types";

/**
 * Every idea the curriculum wants to come back for, in curriculum order.
 *
 * Each lesson owns its own prompts next to the screens that teach them; this file
 * only collects them, the same way `registry.ts` collects lesson metadata.
 */
export const REVIEW_PROMPTS: ReviewPrompt[] = [
  ...CHARACTER_REPRESENTATION_REVIEW,
  ...SHARED_CHARACTER_TABLE_REVIEW,
  ...ASCII_REVIEW,
  ...BREAK_ASCII_REVIEW,
  ...UNICODE_CODE_POINT_REVIEW,
  ...CODE_POINTS_VS_BYTES_REVIEW,
  ...HEXADECIMAL_BRIDGE_REVIEW,
  ...UTF_8_REVIEW,
];

export const REVIEW_PROMPT_IDS = REVIEW_PROMPTS.map((prompt) => prompt.id);

export function getReviewPrompt(id: string) {
  return REVIEW_PROMPTS.find((prompt) => prompt.id === id);
}

/**
 * Construct answers are compared loosely enough to forgive formatting, and no
 * more: "128,640" and "128640" are the same answer, "12864" is not.
 */
export function normalizeConstructAnswer(value: string) {
  return value.trim().toUpperCase().replace(/[\s,_]/g, "");
}

export function isConstructAnswerCorrect(prompt: ReviewPrompt, value: string) {
  if (prompt.kind !== "construct" || !prompt.answer) return false;
  const entered = normalizeConstructAnswer(value);
  if (entered === "") return false;

  return [prompt.answer, ...(prompt.accepts ?? [])]
    .map(normalizeConstructAnswer)
    .includes(entered);
}
