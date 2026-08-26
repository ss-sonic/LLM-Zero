import type { ReviewPrompt } from "../types";

export const HEXADECIMAL_BRIDGE_STEPS = [
  "Binary gets noisy",
  "Four bits, sixteen patterns",
  "Meet six more digits",
  "Build hex digits",
  "One byte, two hex digits",
  "One value, both directions",
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
export const REVERSE_HEX = "F6";
export const REVERSE_BITS = ["1111", "0110"] as const;

export const COMPRESSION_BITS = PAIN_SEQUENCE_A;
export const COMPRESSION_HEX = ["F0", "9F", "9A", "80"] as const;

export const HEXADECIMAL_BRIDGE_REVIEW: ReviewPrompt[] = [
  {
    id: "f1-bits-to-hex",
    lessonSlug: "hexadecimal",
    source: "Foundation bridge · Hexadecimal",
    kind: "construct",
    question: "Write the byte 11110000 in hexadecimal.",
    answer: "F0",
    accepts: ["0xF0"],
    principle: "Split the byte into two four-bit groups: 1111 is 15, written F, and 0000 is 0. So the byte is F0. The value did not change — only the notation did.",
  },
  {
    id: "f1-hex-to-bits",
    lessonSlug: "hexadecimal",
    source: "Foundation bridge · Hexadecimal",
    kind: "construct",
    question: "Write the hex byte 9F as eight bits.",
    answer: "10011111",
    principle: "9 is 1001 and F is 15, which is 1111, so 9F is 10011111. Each hex digit always stands for exactly four bits, which is why one byte is always exactly two hex digits.",
  },
];
