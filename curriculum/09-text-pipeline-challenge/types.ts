import type { RecallAssessment } from "../../components/ui/TextRecall";

/** Step 6's prediction: which encoding is smaller for this particular sentence. */
export type EncodingGuess = "utf-8" | "utf-16" | null;

export type ChallengePersistedState = {
  currentStep: number;
  highestUnlocked: number;
  /** Step 1 — the byte count wagered before any work is done. */
  predictedBytes: string;
  wagerPlaced: boolean;
  /** Step 2 — the pipeline stages in the order the learner has placed them. */
  stageOrder: string[];
  /** Step 3 — a code point per character, derived for ASCII and looked up otherwise. */
  codePointInputs: string[];
  databaseOpen: boolean;
  /** Step 4 — a UTF-8 byte count per character, and the bill that settles step 1. */
  widthInputs: string[];
  totalInput: string;
  /** Step 5 — 你 built by hand: hex digits to bits, the cut, then tagged bytes. */
  digitBitInputs: string[];
  sliceInputs: string[];
  byteHexInputs: string[];
  /** Step 6 — the same sentence under the other two encodings. */
  encodingGuess: EncodingGuess;
  unitInput: string;
  utf16BytesInput: string;
  utf32BytesInput: string;
  /** Step 7 — an unseen stream read back to characters. */
  groupCountInput: string;
  firstCodePointInput: string;
  lastCodePointInput: string;
  /** Step 8 — diagnosing real mojibake, then saying what broke. */
  brokenCountInput: string;
  brokenByteIndex: number | null;
  brokenRecall: string;
  brokenCommitted: boolean;
  brokenAssessment: RecallAssessment;
  /** Step 9 — a character nobody here chose, carried through alone. */
  chosenCharacter: string;
  chosenLengthInput: string;
  chosenHexInput: string;
};
