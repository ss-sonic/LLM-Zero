import type { RecallAssessment } from "../../components/ui/TextRecall";

/** The 1991 design choice. Neither option is wrong; both were actually built. */
export type BetChoice = "compact" | "roomy" | null;

/** How the learner has judged one character against a single 16-bit unit. */
export type FitMark = "fits" | "too-big" | null;

export type ByteOrder = "big" | "little";

export type UtfEncodingsPersistedState = {
  currentStep: number;
  highestUnlocked: number;
  /** Step 1 — which bet the learner would have taken. */
  betChoice: BetChoice;
  /** Step 2 — where character 9 begins under each encoding. */
  utf8ByteInput: string;
  utf32ByteInput: string;
  /** Step 3 — which of the course's own characters survive a 16-bit unit. */
  fitMarks: FitMark[];
  /** Step 4 — how many code points a reserved pair can address. */
  pairValuesInput: string;
  /** Step 5 — the ceiling that patch produces, and Lesson 07 could not explain. */
  ceilingInput: string;
  /** Step 6 — both readings of the same two bytes, then Lesson 02 retrieved. */
  ordersSeen: ByteOrder[];
  orderRecall: string;
  orderCommitted: boolean;
  orderAssessment: RecallAssessment;
  /** Step 7 — the rocket as a surrogate pair, built by hand. */
  offsetInput: string;
  halfBitInputs: string[];
  halfValueInputs: string[];
  /** Step 8 — pricing a CJK string under both variable-width encodings. */
  cjkUtf8Input: string;
  cjkUtf16Input: string;
};
