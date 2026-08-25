export const UTF8_STEPS = [
  "Feel the waste",
  "Variable length creates a boundary problem",
  "Reserve prefix bits",
  "Encode A",
  "Why é needs more room",
  "Encode é",
  "Decode é",
  "Choose a width for 🚀",
  "Build 🚀",
  "Explain the prefixes",
  "Complete",
];

export const UTF8_STORAGE_KEY = "llm-zero:lesson:utf8:v1";

export const A = { symbol: "A", decimal: 65, notation: "U+0041", binary: "1000001", utf8Bits: "01000001", utf8Hex: "41" } as const;
export const E_ACUTE = {
  symbol: "é",
  decimal: 233,
  notation: "U+00E9",
  binary: "11101001",
  paddedPayload: "00011101001",
  payloadGroups: ["00011", "101001"],
  utf8Bits: ["11000011", "10101001"],
  utf8Hex: ["C3", "A9"],
} as const;
export const ROCKET = {
  symbol: "🚀",
  decimal: 128640,
  notation: "U+1F680",
  binary: "11111011010000000",
  paddedPayload: "000011111011010000000",
  payloadGroups: ["000", "011111", "011010", "000000"],
  utf8Bits: ["11110000", "10011111", "10011010", "10000000"],
  utf8Hex: ["F0", "9F", "9A", "80"],
} as const;

export const UTF8_PATTERNS = [
  { width: 1, template: ["0xxxxxxx"], payloadBits: 7 },
  { width: 2, template: ["110xxxxx", "10xxxxxx"], payloadBits: 11 },
  { width: 3, template: ["1110xxxx", "10xxxxxx", "10xxxxxx"], payloadBits: 16 },
  { width: 4, template: ["11110xxx", "10xxxxxx", "10xxxxxx", "10xxxxxx"], payloadBits: 21 },
] as const;
