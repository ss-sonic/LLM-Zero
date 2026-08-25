export type MissingAnswer = "hidden" | "missing" | "binary" | null;
export type PrivateFixAnswer = "size" | "agreement" | "binary" | "needs-work" | null;
export type BiggerAnswer = "private" | "shared" | "guess" | null;
export type MixedAnswer = "ascii" | "outside" | null;

export type BreakingAsciiPersistedState = {
  currentStep: number;
  highestUnlocked: number;
  asciiProofSent: boolean;
  cafeTried: boolean;
  missingAnswer: MissingAnswer;
  privateAssigned: boolean;
  privateSent: boolean;
  privateFixAnswer: PrivateFixAnswer;
  privateRecallText: string;
  worldSeenIds: string[];
  includedAreas: string[];
  biggerAnswer: BiggerAnswer;
  mixedAnswers: MixedAnswer[];
};
