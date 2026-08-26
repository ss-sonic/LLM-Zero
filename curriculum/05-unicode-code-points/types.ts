import type { RecallAssessment } from "../../components/ui/TextRecall";

export type RequirementAnswer = "local" | "shared" | "reuse" | null;
export type CodePointAnswer = "bytes" | "position" | "picture" | null;
export type StorageAnswer = "stored" | "identity" | null;

export type InventedSymbol = "A" | "é" | "न" | "你" | "🚀";
export type InventedTable = Record<InventedSymbol, number>;

/** Lesson 05 closed with a dropdown match and a three-card question before the
 *  completion check became a construction. Both are read on hydrate only. */
export type LegacyChallengeMatches = Array<string | null>;
export type LegacyFinalConceptAnswer = "bytes" | "identity" | "size" | null;

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
  /** The code point the learner derives from ASCII rather than looks up. */
  asciiCodePointInput?: string;
  identityRecall?: string;
  identityCommitted?: boolean;
  identityAssessment?: RecallAssessment;
  challengeMatches?: LegacyChallengeMatches;
  finalConceptAnswer?: LegacyFinalConceptAnswer;
};
