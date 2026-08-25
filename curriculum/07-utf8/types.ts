import type { RecallAssessment } from "../../components/ui/TextRecall";

export type Utf8PersistedState = {
  currentStep?: number;
  highestUnlocked?: number;
  wasteInput?: string;
  boundarySeen?: string[];
  prefixSeen?: number[];
  aBitsInput?: string;
  aHexInput?: string;
  ePayloadInput?: string;
  eBitLengthInput?: string;
  eEncodeGroups?: string[];
  eEncodeHex?: string[];
  eDecodeGroups?: string[];
  eDecodeDecimal?: string;
  capacities?: string[];
  rocketWidth?: string;
  rocketGroups?: string[];
  rocketHex?: string[];
  prefixRecallText?: string;
  prefixRecallCommitted?: boolean;
  prefixRecallAssessment?: RecallAssessment;
};
