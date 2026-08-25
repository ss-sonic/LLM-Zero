import { BYTE_BASE } from "./config";

export const BYTE_MAX = BYTE_BASE - 1;

export function byteWeights(width: number) {
  return Array.from({ length: width }, (_, index) => BYTE_BASE ** (width - index - 1));
}

export function maxValueForWidth(width: number) {
  return BYTE_BASE ** width - 1;
}

export function encodeFixedWidth(value: number, width: number): number[] | null {
  if (!Number.isInteger(value) || value < 0 || value > maxValueForWidth(width)) return null;
  return byteWeights(width).map((weight) => Math.floor(value / weight) % BYTE_BASE);
}

export function decodeFixedWidth(bytes: number[]) {
  return bytes.reduce(
    (total, byte, index) => total + byte * BYTE_BASE ** (bytes.length - index - 1),
    0,
  );
}

export function isByteValue(value: number) {
  return Number.isInteger(value) && value >= 0 && value <= BYTE_MAX;
}
