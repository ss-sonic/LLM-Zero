export type SymbolKey = "A" | "B" | "C";
export type MappingTable = Record<SymbolKey, number>;
export type MismatchReason = "changed" | "rules" | "binary" | null;
export type ScaleChoice = "instructions" | "agree" | null;
export type AgreementAnswer = "intrinsic" | "shared" | null;

export type SharedCharacterTablePersistedState = {
  currentStep: number;
  highestUnlocked: number;
  mismatchSent: boolean;
  mismatchReason: MismatchReason;
  instructionsAttached: boolean;
  scaleChoice: ScaleChoice;
  sharedTable: MappingTable;
  sharedApplied: boolean;
  sharedSent: boolean;
  weirdApplied: boolean;
  weirdTested: boolean;
  agreementAnswer: AgreementAnswer;
  encodedValues: Array<number | null>;
  messageSent: boolean;
  receiverBroken: boolean;
};
