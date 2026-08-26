import { LESSONS } from "../../curriculum/registry";
import { REVIEW_PROMPTS, type ReviewPrompt } from "../../curriculum/review";
import { readPersistedLessonState, writePersistedLessonState } from "../lesson/persistence";
import { getCourseProgressState } from "./progress";

export const REVIEW_STORAGE_KEY = "llm-zero:review:v1";

export const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Expanding intervals, in days, between successful retrievals.
 *
 * Retrieval inside a lesson happens minutes after the idea was built, when it is
 * still in the room. Spacing is what turns that into something a learner still
 * has months later, so an idea returns after a day, then a few days, then weeks.
 * A missed retrieval sends the idea back to the start of the ladder rather than
 * merely holding it in place — it is evidence the spacing outran the memory.
 */
export const REVIEW_INTERVALS_DAYS = [1, 3, 7, 16, 35, 90] as const;

export type ReviewScheduleEntry = {
  /** How many successful retrievals in a row; indexes into REVIEW_INTERVALS_DAYS. */
  stage: number;
  dueAt: number;
};

export type ReviewSchedule = Record<string, ReviewScheduleEntry>;

export function intervalForStage(stage: number) {
  const index = Math.max(0, Math.min(stage, REVIEW_INTERVALS_DAYS.length - 1));
  return REVIEW_INTERVALS_DAYS[index] * DAY_MS;
}

function isEntry(value: unknown): value is ReviewScheduleEntry {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<ReviewScheduleEntry>;
  return typeof candidate.stage === "number"
    && Number.isFinite(candidate.stage)
    && typeof candidate.dueAt === "number"
    && Number.isFinite(candidate.dueAt);
}

export function normalizeSchedule(value: unknown, promptIds: readonly string[]): ReviewSchedule {
  if (!value || typeof value !== "object") return {};

  const allowed = new Set(promptIds);
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([id, entry]) => allowed.has(id) && isEntry(entry))
    .map(([id, entry]) => [id, {
      stage: Math.max(0, Math.round((entry as ReviewScheduleEntry).stage)),
      dueAt: (entry as ReviewScheduleEntry).dueAt,
    }] as const);

  return Object.fromEntries(entries);
}

/**
 * Gives every prompt from a finished lesson a first due date.
 *
 * Completion time is not recorded anywhere, so the first review is scheduled the
 * first time we notice the lesson is done. That can only ever delay a review,
 * never skip one.
 */
export function ensureScheduled(
  schedule: ReviewSchedule,
  eligiblePromptIds: readonly string[],
  now: number,
): ReviewSchedule {
  const missing = eligiblePromptIds.filter((id) => !schedule[id]);
  if (missing.length === 0) return schedule;

  const seeded = Object.fromEntries(missing.map((id) => [id, { stage: 0, dueAt: now + intervalForStage(0) }]));
  return { ...schedule, ...seeded };
}

export function isDue(entry: ReviewScheduleEntry | undefined, now: number) {
  return entry !== undefined && entry.dueAt <= now;
}

export function duePromptIds(schedule: ReviewSchedule, eligiblePromptIds: readonly string[], now: number) {
  return eligiblePromptIds
    .filter((id) => isDue(schedule[id], now))
    .sort((a, b) => schedule[a].dueAt - schedule[b].dueAt);
}

/** A correct retrieval moves the idea one rung up the ladder; a missed one drops it to the bottom. */
export function recordReview(
  schedule: ReviewSchedule,
  promptId: string,
  remembered: boolean,
  now: number,
): ReviewSchedule {
  const current = schedule[promptId] ?? { stage: 0, dueAt: now };
  const stage = remembered ? Math.min(current.stage + 1, REVIEW_INTERVALS_DAYS.length - 1) : 0;

  return { ...schedule, [promptId]: { stage, dueAt: now + intervalForStage(stage) } };
}

export function nextDueAt(schedule: ReviewSchedule, eligiblePromptIds: readonly string[]) {
  const dates = eligiblePromptIds
    .map((id) => schedule[id]?.dueAt)
    .filter((value): value is number => typeof value === "number");

  return dates.length ? Math.min(...dates) : null;
}

/** Only ideas from lessons the learner has actually finished come back. */
export function eligiblePrompts(
  isLessonCompleted: (slug: string) => boolean,
  prompts: readonly ReviewPrompt[] = REVIEW_PROMPTS,
) {
  return prompts.filter((prompt) => isLessonCompleted(prompt.lessonSlug));
}

export function completedLessonSlugs() {
  return new Set(
    LESSONS
      .filter((lesson) => lesson.status === "available" && getCourseProgressState(lesson) === "completed")
      .map((lesson) => lesson.slug),
  );
}

export function readSchedule(promptIds: readonly string[]) {
  return normalizeSchedule(readPersistedLessonState<ReviewSchedule>(REVIEW_STORAGE_KEY), promptIds);
}

export function writeSchedule(schedule: ReviewSchedule) {
  writePersistedLessonState(REVIEW_STORAGE_KEY, schedule);
}
