export type RequirementAnswer = "local" | "shared" | "reuse" | null;
export type CodePointAnswer = "bytes" | "position" | "picture" | null;
export type StorageAnswer = "stored" | "identity" | null;
export type FinalConceptAnswer = "bytes" | "identity" | "size" | null;

export type InventedSymbol = "A" | "é" | "न" | "你" | "🚀";
export type InventedTable = Record<InventedSymbol, number>;

export type ChallengeMatches = Array<string | null>;

export type UnicodeCodePointPersistedState = {
  currentStep?: number;
  highestUnlocked?: number;
  requirementAnswer?: RequirementAnswer;
  inventedTable?: InventedTable;
  tablePublished?: boolean;
  tableSent?: boolean;
  codePointAnswer?: CodePointAnswer;
  unicodeRevealed?: boolean;
  notationSeenIds?: string[];
  notationSelectedId?: string;
  storageAnswer?: StorageAnswer;
  challengeMatches?: ChallengeMatches;
  finalConceptAnswer?: FinalConceptAnswer;
};
