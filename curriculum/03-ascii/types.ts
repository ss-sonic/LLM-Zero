import type { RecallAssessment } from "../../components/ui/TextRecall";

export type ScaleChoice = "pairwise" | "published" | "guess" | null;
export type Why65Answer = "shape" | "standard" | "binary" | null;

export type TinyStandard = {
  A: number;
  B: number;
  C: number;
};

export type AsciiPersistedState = {
  currentStep: number;
  highestUnlocked: number;
  scaleChoice: ScaleChoice;
  tinyStandard: TinyStandard;
  tinyPublished: boolean;
  tinySent: boolean;
  asciiRevealed: boolean;
  why65Answer: Why65Answer;
  explorerValue: number;
  exploredValues: number[];
  /** Typed ASCII values, so the check is a construction rather than a menu. */
  catInputs: string[];
  catSent: boolean;
  boundarySampleId: string | null;
  /** What publishing a standard solved, retrieved once its boundary is visible. */
  boundaryRecall: string;
  boundaryCommitted: boolean;
  boundaryAssessment: RecallAssessment;
  /** Read on hydrate only: the pre-construction multiple-choice answers. */
  catValues?: Array<number | null>;
};
