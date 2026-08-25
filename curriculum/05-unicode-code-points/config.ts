export const UNICODE_CODE_POINT_STEPS = [
  "A system for the world",
  "Invent stable identities",
  "Name the idea",
  "Meet Unicode",
  "Read U+ notation",
  "Identity is not storage",
  "Global identity challenge",
  "Complete",
];

export const UNICODE_CODE_POINT_STORAGE_KEY = "llm-zero:lesson:unicode-code-points:v1";

export const INVENTED_DEFAULT_TABLE = {
  A: 10,
  "é": 274,
  "न": 8000,
  "你": 50000,
  "🚀": 900000,
} as const;

export const UNICODE_EXAMPLES = [
  { id: "latin-a", symbol: "A", name: "LATIN CAPITAL LETTER A", decimal: 65 },
  { id: "e-acute", symbol: "é", name: "LATIN SMALL LETTER E WITH ACUTE", decimal: 233 },
  { id: "devanagari-na", symbol: "न", name: "DEVANAGARI LETTER NA", decimal: 2344 },
  { id: "cjk-ni", symbol: "你", name: "CJK UNIFIED IDEOGRAPH-4F60", decimal: 20320 },
  { id: "rocket", symbol: "🚀", name: "ROCKET", decimal: 128640 },
] as const;

export const WORLD_SYMBOLS = ["A", "é", "Ω", "Ж", "न", "م", "你", "あ", "★", "🚀"] as const;

export const INVENTED_SYMBOLS = ["A", "é", "न", "你", "🚀"] as const;
