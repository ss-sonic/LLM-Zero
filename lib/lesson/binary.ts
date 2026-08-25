export const BYTE_PLACE_VALUES = [128, 64, 32, 16, 8, 4, 2, 1] as const;

export function toBits(value: number) {
  return value.toString(2).padStart(8, "0").slice(-8).split("");
}

export function bitsToNumber(bits: string[]) {
  return parseInt(bits.join(""), 2);
}

export function emptyByte() {
  return Array(8).fill("0") as string[];
}

export function isBitArray(value: unknown): value is string[] {
  return Array.isArray(value)
    && value.length === 8
    && value.every((bit) => bit === "0" || bit === "1");
}
