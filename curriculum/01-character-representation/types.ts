export type BitPhase = "build" | "explain" | "play";
export type ConventionAnswer = "yes" | "no" | null;

export type CharacterRepresentationPersistedState = {
  currentStep: number;
  highestUnlocked: number;
  introGuess: string | null;
  numberDraft: string;
  agreedNumber: number;
  conventionAnswer: ConventionAnswer;
  sendRevealed: boolean;
  labBits: string[];
  bitPhase: BitPhase;
  hasFlippedBit: boolean;
  /** The learner's reconstruction of what Computer 1 actually stores. */
  proofBits: string[];
  /** The receiver rule the learner works out for the identical bits. */
  receiverRule: string;
};
