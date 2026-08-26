/**
 * The two encodings Lesson 08 compares UTF-8 against.
 *
 * Both are fixed-width bets. UTF-32 bet that memory would be cheap enough to pay
 * four bytes for every character, and it was right but nobody could afford it in
 * 1991. UTF-16 bet that 65,536 characters would be enough, lost, and could not
 * widen its unit afterwards because files and APIs already assumed it — so it
 * patched itself with surrogate pairs instead.
 *
 * That patch is where Unicode's ceiling comes from, which is the debt Lesson 07
 * left open, so the derivation lives here rather than being asserted on a screen.
 */

export const BMP_MAX = 0xffff;
export const SUPPLEMENTARY_BASE = 0x10000;

export const HIGH_SURROGATE_MIN = 0xd800;
export const HIGH_SURROGATE_MAX = 0xdbff;
export const LOW_SURROGATE_MIN = 0xdc00;
export const LOW_SURROGATE_MAX = 0xdfff;

/** Ten bits of room in each half of a pair, so 1,024 values each. */
export const SURROGATE_BLOCK_SIZE = HIGH_SURROGATE_MAX - HIGH_SURROGATE_MIN + 1;
export const SURROGATE_BITS = Math.log2(SURROGATE_BLOCK_SIZE);

export type Endianness = "big" | "little";

export function isHighSurrogate(unit: number) {
  return unit >= HIGH_SURROGATE_MIN && unit <= HIGH_SURROGATE_MAX;
}

export function isLowSurrogate(unit: number) {
  return unit >= LOW_SURROGATE_MIN && unit <= LOW_SURROGATE_MAX;
}

export function isSurrogate(codePoint: number) {
  return codePoint >= HIGH_SURROGATE_MIN && codePoint <= LOW_SURROGATE_MAX;
}

/**
 * Unicode's ceiling, derived rather than quoted.
 *
 * A pair carries one value from each 1,024-entry block, so it addresses
 * 1,024 × 1,024 code points above the 65,536 a single unit can already reach.
 * The highest of them is U+10FFFF — a number produced by a 1990s compatibility
 * patch, not by a decision about how many characters the world needs.
 */
export function ceilingFromSurrogates() {
  return SUPPLEMENTARY_BASE + SURROGATE_BLOCK_SIZE * SURROGATE_BLOCK_SIZE - 1;
}

/** Every code point except the surrogate block itself, which can never be a character. */
export function assignableCodePoints() {
  return ceilingFromSurrogates() + 1 - (LOW_SURROGATE_MAX - HIGH_SURROGATE_MIN + 1);
}

export function needsSurrogatePair(codePoint: number) {
  return codePoint > BMP_MAX;
}

export function toSurrogatePair(codePoint: number) {
  if (!needsSurrogatePair(codePoint) || codePoint > ceilingFromSurrogates()) return null;

  const offset = codePoint - SUPPLEMENTARY_BASE;
  return {
    offset,
    high: HIGH_SURROGATE_MIN + Math.floor(offset / SURROGATE_BLOCK_SIZE),
    low: LOW_SURROGATE_MIN + (offset % SURROGATE_BLOCK_SIZE),
  };
}

export function fromSurrogatePair(high: number, low: number) {
  if (!isHighSurrogate(high) || !isLowSurrogate(low)) return null;
  return SUPPLEMENTARY_BASE
    + (high - HIGH_SURROGATE_MIN) * SURROGATE_BLOCK_SIZE
    + (low - LOW_SURROGATE_MIN);
}

export function utf16Units(codePoint: number): number[] | null {
  if (isSurrogate(codePoint) || codePoint < 0 || codePoint > ceilingFromSurrogates()) return null;
  if (!needsSurrogatePair(codePoint)) return [codePoint];

  const pair = toSurrogatePair(codePoint);
  return pair ? [pair.high, pair.low] : null;
}

export function utf16UnitsForText(text: string) {
  return Array.from(text).flatMap((character) => utf16Units(character.codePointAt(0) ?? 0) ?? []);
}

/** UTF-32 is the code point itself, padded to a machine word. */
export function utf32Unit(codePoint: number) {
  return codePoint;
}

/**
 * Splits a multi-byte unit into bytes.
 *
 * This is the only place byte order can matter, and it matters precisely because
 * the unit is wider than a byte. UTF-8's unit is one byte, so it has no such
 * choice to disagree about.
 */
export function unitToBytes(unit: number, width: number, endianness: Endianness = "big") {
  const bytes = Array.from({ length: width }, (_, index) => (unit >> ((width - index - 1) * 8)) & 0xff);
  return endianness === "big" ? bytes : bytes.reverse();
}

export function bytesToUnit(bytes: number[], endianness: Endianness = "big") {
  const ordered = endianness === "big" ? bytes : [...bytes].reverse();
  return ordered.reduce((total, byte) => total * 256 + byte, 0);
}

export function toHex(value: number, digits: number) {
  return value.toString(16).toUpperCase().padStart(digits, "0");
}

export function utf16ByteLength(text: string) {
  return utf16UnitsForText(text).length * 2;
}

export function utf32ByteLength(text: string) {
  return Array.from(text).length * 4;
}
