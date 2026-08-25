import type { RecallAssessment } from "../../components/ui/TextRecall";

export type RuleConclusion = "code-point" | "rule" | null;

export type CodePointsVsBytesPersistedState = {
  currentStep: number;
  highestUnlocked: number;
  unicodeRecallText: string;
  unicodeRecallCommitted: boolean;
  unicodeRecallAssessment: RecallAssessment;
  byteBits: string[];
  patternCountInput: string;
  storageInputs: string[];
  inspectedWidths: number[];
  ruleConclusion: RuleConclusion;
  mismatchSent: boolean;
  agreementRecallText: string;
  agreementRecallCommitted: boolean;
  agreementRecallAssessment: RecallAssessment;
  encodingRevealed: boolean;
  encodeAInputs: string[];
  decodeRocketInput: string;
  costTotalInput: string;
  costZeroInput: string;
};
