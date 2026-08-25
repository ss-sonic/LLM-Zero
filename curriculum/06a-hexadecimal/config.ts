export const HEXADECIMAL_BRIDGE_STEPS = [
  "Binary gets noisy",
  "Four bits, sixteen patterns",
  "Meet six more digits",
  "Build hex digits",
  "One byte, two hex digits",
  "Convert both ways",
  "Compress the bytes",
  "Complete",
];

export const HEXADECIMAL_BRIDGE_STORAGE_KEY = "llm-zero:foundation:hexadecimal:v1";

export const NIBBLE_WEIGHTS = [8, 4, 2, 1] as const;
export const HEX_DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"] as const;

export const PAIN_SEQUENCE_A = ["11110000", "10011111", "10011010", "10000000"] as const;
export const PAIN_SEQUENCE_B = ["11110000", "10011111", "10011011", "10000000"] as const;
export const PAIN_DIFFERENCE_INDEX = 2;

export const BUILD_TARGETS = [
  { hex: "A", decimal: 10, bits: "1010" },
  { hex: "C", decimal: 12, bits: "1100" },
  { hex: "F", decimal: 15, bits: "1111" },
] as const;

export const A_BYTE_BITS = "01000001";
export const A_BYTE_HEX = ["4", "1"] as const;
export const A_CODE_POINT_DECIMAL = 65;

export const FORWARD_BINARY = "11110110";
export const FORWARD_HEX = ["F", "6"] as const;
export const REVERSE_HEX = "9A";
export const REVERSE_BITS = ["1001", "1010"] as const;

export const COMPRESSION_BITS = PAIN_SEQUENCE_A;
export const COMPRESSION_HEX = ["F0", "9F", "9A", "80"] as const;
