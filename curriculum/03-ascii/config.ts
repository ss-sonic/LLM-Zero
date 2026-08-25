export const ASCII_STEPS = [
  "Scale the agreement",
  "Publish a standard",
  "Meet ASCII",
  "Why A = 65?",
  "Explore the table",
  "Encode CAT",
  "Find the boundary",
  "Complete",
];

export const ASCII_STORAGE_KEY = "llm-zero:lesson:ascii:v1";

export const DEFAULT_TINY_STANDARD = { A: 14, B: 55, C: 8 } as const;

export const ASCII_LANDMARKS = [
  { label: "space", character: " ", value: 32 },
  { label: "0", character: "0", value: 48 },
  { label: "1", character: "1", value: 49 },
  { label: "A", character: "A", value: 65 },
  { label: "B", character: "B", value: 66 },
  { label: "C", character: "C", value: 67 },
  { label: "a", character: "a", value: 97 },
  { label: "b", character: "b", value: 98 },
  { label: "c", character: "c", value: 99 },
] as const;

export const CAT_ASCII = { C: 67, A: 65, T: 84 } as const;

export const ASCII_BOUNDARY_SAMPLES = [
  { id: "hello", label: "Hello", text: "Hello" },
  { id: "cafe", label: "café", text: "café" },
  { id: "hindi", label: "नमस्ते", text: "नमस्ते" },
  { id: "chinese", label: "你好", text: "你好" },
  { id: "rocket", label: "🚀", text: "🚀" },
] as const;
