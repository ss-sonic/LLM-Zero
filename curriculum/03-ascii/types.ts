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
  catValues: Array<number | null>;
  catSent: boolean;
  boundarySampleId: string | null;
};
