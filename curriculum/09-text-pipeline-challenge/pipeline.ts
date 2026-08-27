/**
 * The Phase 1 pipeline, assembled in one place.
 *
 * Nothing here is a new rule. Every value is produced by the helpers the lessons
 * already built — ASCII from Lesson 03, code points from Lesson 05, UTF-8 from
 * Lesson 07, UTF-16 units from Lesson 08 — because the point of the challenge is
 * that the pieces compose, and a re-implementation here would quietly break that
 * claim.
 *
 * Kept separate from the screens so the numbers the challenge prints can be
 * checked against the platform's own encoder rather than against our arithmetic.
 */

import { asciiCode } from "../03-ascii/ascii";
import { toUnicodeNotation } from "../05-unicode-code-points/unicode";
import { encodeCodePoint, isScalarValue, toHexByte } from "../07-utf-8/utf8";
import { utf16Units } from "../08-utf-encodings/encodings";

/**
 * The stages, in the order the learner has to rebuild.
 *
 * Hexadecimal is deliberately absent. It is how we write a byte down, not a step
 * that happens to a character, and the challenge would be teaching a falsehood if
 * it appeared here as a sixth stage.
 */
export const PIPELINE_STAGES = [
  {
    id: "symbol",
    label: "A visible symbol",
    detail: "What a human sees and calls one character.",
    source: "Lesson 01",
  },
  {
    id: "code-point",
    label: "A Unicode code point",
    detail: "One number the whole world agrees identifies that character.",
    source: "Lesson 05",
  },
  {
    id: "form",
    label: "A choice of UTF-8 form",
    detail: "How many bytes this particular number needs: one, two, three or four.",
    source: "Lesson 07",
  },
  {
    id: "payload",
    label: "The number's bits, cut to fit",
    detail: "The code point in binary, sliced into the room each byte leaves free.",
    source: "Lesson 07",
  },
  {
    id: "bytes",
    label: "Tagged bytes",
    detail: "Each slice given its tag, so a reader can find the boundaries again.",
    source: "Lesson 07",
  },
] as const;

export type PipelineStageId = (typeof PIPELINE_STAGES)[number]["id"];

export const PIPELINE_ORDER = PIPELINE_STAGES.map((stage) => stage.id) as PipelineStageId[];

/**
 * A fixed scramble rather than a random one: the screens are server-rendered, and
 * a learner comparing notes with someone else should be looking at the same puzzle.
 */
export const SCRAMBLED_STAGE_IDS: PipelineStageId[] = ["payload", "symbol", "bytes", "form", "code-point"];

export function getStage(id: PipelineStageId) {
  return PIPELINE_STAGES.find((stage) => stage.id === id)!;
}

/** The first position where the learner's order departs from the pipeline, or -1. */
export function firstOutOfPlace(order: readonly string[]) {
  for (let index = 0; index < order.length; index += 1) {
    if (order[index] !== PIPELINE_ORDER[index]) return index;
  }
  return -1;
}

export function isPipelineComplete(order: readonly string[]) {
  return order.length === PIPELINE_ORDER.length && firstOutOfPlace(order) === -1;
}

export type PipelineCharacter = {
  index: number;
  symbol: string;
  /** An invisible glyph is unreadable in a table, so a space says so in words. */
  label: string;
  codePoint: number;
  notation: string;
  /** True when Lesson 05's carry-over rule means the learner can derive this one. */
  isAscii: boolean;
  utf8Bytes: number[];
  utf8Hex: string[];
  utf8Length: number;
  utf16Units: number[];
  utf16Length: number;
  utf32Length: number;
};

export function describeCharacter(symbol: string, index = 0): PipelineCharacter | null {
  const codePoint = symbol.codePointAt(0);
  if (codePoint === undefined || !isScalarValue(codePoint)) return null;

  const utf8Bytes = encodeCodePoint(codePoint);
  const units = utf16Units(codePoint);
  if (!utf8Bytes || !units) return null;

  return {
    index,
    symbol,
    label: symbol === " " ? "space" : symbol,
    codePoint,
    notation: toUnicodeNotation(codePoint),
    isAscii: asciiCode(symbol) !== null,
    utf8Bytes,
    utf8Hex: utf8Bytes.map(toHexByte),
    utf8Length: utf8Bytes.length,
    utf16Units: units,
    utf16Length: units.length * 2,
    utf32Length: 4,
  };
}

/** Splits by code point, not by UTF-16 unit — which is why 🚀 counts once here. */
export function analyzeSentence(text: string): PipelineCharacter[] {
  return Array.from(text)
    .map((symbol, index) => describeCharacter(symbol, index))
    .filter((entry): entry is PipelineCharacter => entry !== null);
}

export function sentenceTotals(characters: readonly PipelineCharacter[]) {
  return {
    characters: characters.length,
    utf8: characters.reduce((total, entry) => total + entry.utf8Length, 0),
    utf16Units: characters.reduce((total, entry) => total + entry.utf16Units.length, 0),
    utf16: characters.reduce((total, entry) => total + entry.utf16Length, 0),
    utf32: characters.length * 4,
  };
}

/**
 * ISO-8859-1, which maps byte N to code point N and has no idea that a byte can
 * continue another one.
 *
 * It is the rule a confused reader falls back to, and the reason mojibake always
 * looks the same way: every byte above 127 becomes a character of its own.
 */
export function readAsLatin1(bytes: readonly number[]) {
  return bytes.map((byte) => String.fromCharCode(byte)).join("");
}

export type ChosenCharacter =
  | { ok: true; character: PipelineCharacter }
  | { ok: false; reason: "empty" | "ascii" | "unusable" };

/**
 * The finale takes a character nobody here chose, so it has to say no clearly.
 *
 * ASCII is refused on purpose: a one-byte character makes the whole exercise
 * trivial, and the learner has already proved that case in Lesson 07.
 */
export function chooseCharacter(input: string): ChosenCharacter {
  const symbol = Array.from(input)[0];
  if (symbol === undefined) return { ok: false, reason: "empty" };

  const described = describeCharacter(symbol);
  if (!described) return { ok: false, reason: "unusable" };
  if (described.isAscii) return { ok: false, reason: "ascii" };

  return { ok: true, character: described };
}

/** Accepts "E4 BD A0", "e4bda0" and "0xE4 0xBD 0xA0" as the same answer. */
export function normalizeHexBytes(value: string) {
  return value.trim().toUpperCase().replace(/0X/g, "").replace(/[^0-9A-F]/g, "");
}

export function hexBytesMatch(value: string, expected: readonly string[]) {
  return normalizeHexBytes(value) === expected.join("");
}

/**
 * Code points get typed as decimal or as U+ notation, and both are the same
 * answer — the notation is a way of writing the number, which is Lesson 05's
 * point and the hexadecimal bridge's.
 *
 * A bare string of digits is read as decimal, because that is what the screen
 * asks for. `U+`, `0x` or any digit outside 0–9 makes it unambiguously hex.
 */
export function codePointMatches(value: string, expected: number) {
  const trimmed = value.trim().toUpperCase().replace(/[\s,_]/g, "");
  if (trimmed === "") return false;

  const prefixed = /^(U\+|0X)/.test(trimmed);
  const digits = trimmed.replace(/^(U\+|0X)/, "");
  if (!/^[0-9A-F]+$/.test(digits)) return false;

  const readAsHex = prefixed || /[A-F]/.test(digits);
  return (readAsHex ? parseInt(digits, 16) : Number(digits)) === expected;
}
