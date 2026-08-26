import type { RecallAssessment } from "../../components/ui/TextRecall";

/** How the learner has labelled a byte while splitting the final stream. */
export type ByteLabel = "start" | "continuation" | null;

export type Utf8PersistedState = {
  currentStep: number;
  highestUnlocked: number;
  /** Step 1 — the zero bytes counted in the fixed-width bill. */
  zeroCountInput: string;
  /** Step 2 — byte counts under the naive "as many as it needs" rule. */
  sizeInputs: string[];
  /** Step 3 — where the learner cut the ambiguous stream, and whether they committed. */
  streamSplits: boolean[];
  streamCommitted: boolean;
  /** Step 4 — ASCII's ceiling, retrieved, then the bit that must open a multi-byte byte. */
  asciiMaxInput: string;
  /** "" until the learner commits to the opening bit of a multi-byte byte. */
  leadBit: string;
  /** Step 5 — the lead tags the learner writes for the 2-, 3- and 4-byte forms. */
  tagInputs: string[];
  /** Step 6 — free bits left in each form once the tags are paid for. */
  roomInputs: string[];
  /** Step 7 — the rocket, built by hand. */
  formInput: string;
  digitBitInputs: string[];
  payloadInputs: string[];
  /** Step 8 — each byte of a real stream labelled from its tag alone. */
  byteLabels: ByteLabel[];
  resyncSeen: boolean;
  /** Closing recall of why the tags make a stream readable from anywhere. */
  closingRecall: string;
  closingCommitted: boolean;
  closingAssessment: RecallAssessment;
};
