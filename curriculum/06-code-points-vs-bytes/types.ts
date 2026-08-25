import type { RecallAssessment } from "../../components/ui/TextRecall";

/** Screen 4: is one byte sequence the "real" one, or is each rule's answer its own? */
export type ForcedAnswer = "one-correct" | "rule-relative" | null;

export type CodePointsVsBytesPersistedState = {
  currentStep: number;
  highestUnlocked: number;

  // Screen 1 — retrieve what Unicode settled.
  unicodeRecallText: string;
  unicodeRecallCommitted: boolean;
  unicodeRecallAssessment: RecallAssessment;

  // Screen 2 — rebuild the byte range from Lesson 01, then derive the pattern count.
  byteBits: string[];
  patternCountInput: string;

  // Screen 3 — build the code point out of three byte positions.
  buildBytes: string[];

  // Screen 4 — compare fixed widths, then commit to what that means.
  widthsSeen: number[];
  forcedAnswer: ForcedAnswer;

  // Screen 5 — retrieve the Lesson 02 principle one layer up.
  streamSent: boolean;
  decodeRecallText: string;
  decodeRecallCommitted: boolean;
  decodeRecallAssessment: RecallAssessment;

  // Screen 6 — reveal the term.
  encodingRevealed: boolean;

  // Screen 7 — encode A, decode the rocket's bytes.
  encodeInputs: string[];
  decodeInput: string;

  // Screen 8 — count what a fixed width costs.
  costTotalInput: string;
  costZeroInput: string;
};
