export type HexadecimalBridgePersistedState = {
  currentStep: number;
  highestUnlocked: number;
  painGuess: number | null;
  nibbleBits: string[];
  patternCount: string;
  symbolsRevealed: boolean;
  builderBits: string[];
  builtTargets: string[];
  byteHex: string[];
  byteDecimal: string;
  forwardHex: string[];
  reverseBits: string[];
  compressedHex: string[];
};
