export type LessonStatus = "available" | "coming-soon";

export type LessonProgressMeta = {
  storageKey: string;
  stepCount: number;
};

export type LessonMeta = {
  number: number;
  displayNumber?: string;
  slug: string;
  title: string;
  question: string;
  description: string;
  module: string;
  status: LessonStatus;
  progress?: LessonProgressMeta;
};

export type LessonStepMeta = {
  id: string;
  label: string;
};

export type ReviewPromptKind = "construct" | "recall";

/**
 * One idea a lesson wants back after time has passed.
 *
 * A prompt has to stand on its own: the learner meets it days later with the
 * lesson closed, so it may not lean on anything that was on screen at the time.
 * `construct` prompts have a determinate answer the machine can check.
 * `recall` prompts are prose and are never machine-graded — the learner commits,
 * sees the principle, and judges their own retrieval.
 */
export type ReviewPrompt = {
  id: string;
  lessonSlug: string;
  /** Where this idea came from, e.g. "Lesson 03 · ASCII". */
  source: string;
  kind: ReviewPromptKind;
  /** Framing the learner needs to answer at all — never a restatement of the answer. */
  context?: string;
  question: string;
  /** construct only: the expected answer, compared after normalization. */
  answer?: string;
  /** construct only: other spellings of the same answer. */
  accepts?: string[];
  /** The canonical idea, revealed only after the learner has committed. */
  principle: string;
};
