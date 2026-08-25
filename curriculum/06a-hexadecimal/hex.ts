import { HEX_DIGITS } from "./config";

export function bitsToValue(bits: string[]) {
  return bits.reduce((total, bit) => total * 2 + (bit === "1" ? 1 : 0), 0);
}

export function nibbleToHex(bits: string[]) {
  return HEX_DIGITS[bitsToValue(bits)];
}

export function hexDigitToBits(digit: string) {
  const value = HEX_DIGITS.indexOf(digit.toUpperCase() as (typeof HEX_DIGITS)[number]);
  if (value < 0) return null;
  return value.toString(2).padStart(4, "0");
}

export function normalizeHex(value: string) {
  return value.trim().toUpperCase();
}

export function isNibbleBits(value: unknown): value is string[] {
  return Array.isArray(value) && value.length === 4 && value.every((bit) => bit === "0" || bit === "1");
}
