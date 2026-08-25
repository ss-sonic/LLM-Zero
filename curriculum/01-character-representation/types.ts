export type BitPhase = "build" | "explain" | "play";
export type ConventionAnswer = "yes" | "no" | null;
export type FinalAnswer = "letter" | "representation" | null;

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
  finalAnswer: FinalAnswer;
};
