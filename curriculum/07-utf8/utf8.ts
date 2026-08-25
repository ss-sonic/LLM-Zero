export function normalizeHex(value: string) {
  return value.trim().replace(/^0x/i, "").toUpperCase();
}

export function normalizeBits(value: string) {
  return value.replace(/\s/g, "");
}

export function allMatch(values: string[], expected: readonly string[], normalize = (value: string) => value.trim()) {
  return expected.every((item, index) => normalize(values[index] ?? "") === item);
}
