export const BYTE_MAX = 255;
export const BYTE_PATTERNS = 256;

/**
 * Place values for a fixed-width byte rule, most significant first.
 * Width 3 gives [65536, 256, 1] — positional notation in base 256.
 */
export function byteWeights(width: number) {
  return Array.from({ length: width }, (_, index) => BYTE_PATTERNS ** (width - 1 - index));
}

/** Largest value a fixed-width rule can express: 256^width − 1. */
export function maxValueForWidth(width: number) {
  return BYTE_PATTERNS ** width - 1;
}

export function fitsInWidth(value: number, width: number) {
  return value >= 0 && value <= maxValueForWidth(width);
}

/** Split a value into `width` byte positions, or null when it does not fit. */
export function encodeFixed(value: number, width: number): number[] | null {
  if (!Number.isInteger(value) || !fitsInWidth(value, width)) return null;
  return byteWeights(width).map((weight) => Math.floor(value / weight) % BYTE_PATTERNS);
}

/** Recombine byte positions back into the value they stand for. */
export function decodeFixed(bytes: number[]) {
  return bytes.reduce((total, byte, index) => total + byte * BYTE_PATTERNS ** (bytes.length - 1 - index), 0);
}

export function isByteValue(value: number) {
  return Number.isInteger(value) && value >= 0 && value <= BYTE_MAX;
}

/** Encode every code point in `text`, flattened into one byte stream. */
export function encodeText(text: string, width: number) {
  return Array.from(text).flatMap((character) => encodeFixed(character.codePointAt(0) ?? 0, width) ?? []);
}

/**
 * Read a byte stream in fixed-size groups. A trailing partial group cannot be
 * decoded at all, which is the failure the mismatch screen puts on screen.
 */
export function readInGroups(bytes: number[], width: number) {
  const groups: { bytes: number[]; value: number | null }[] = [];
  for (let index = 0; index < bytes.length; index += width) {
    const group = bytes.slice(index, index + width);
    groups.push({ bytes: group, value: group.length === width ? decodeFixed(group) : null });
  }
  return groups;
}

/** U+ notation for a code point, matching the convention introduced in Lesson 05. */
export function toUnicodeNotation(codePoint: number) {
  return `U+${codePoint.toString(16).toUpperCase().padStart(4, "0")}`;
}
