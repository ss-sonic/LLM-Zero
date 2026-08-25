import type { RecallAssessment } from "../../components/ui/TextRecall";

export type MissingAnswer = "hidden" | "missing" | "binary" | null;
export type BiggerAnswer = "private" | "shared" | "guess" | null;
export type MixedAnswer = "ascii" | "outside" | null;

/** Lesson 04 shipped a machine-graded recall before self-assessment replaced it. */
export type LegacyPrivateFixAnswer = "size" | "agreement" | "binary" | "needs-work" | null;

export type BreakingAsciiPersistedState = {
  currentStep: number;
  highestUnlocked: number;
  asciiProofSent: boolean;
  cafeTried: boolean;
  missingAnswer: MissingAnswer;
  privateAssigned: boolean;
  privateSent: boolean;
  privateRecallText: string;
  privateRecallCommitted: boolean;
  privateRecallAssessment: RecallAssessment;
  /** Read on hydrate only, so learners mid-lesson before the change still resume. */
  privateFixAnswer?: LegacyPrivateFixAnswer;
  worldSeenIds: string[];
  includedAreas: string[];
  biggerAnswer: BiggerAnswer;
  mixedAnswers: MixedAnswer[];
};
