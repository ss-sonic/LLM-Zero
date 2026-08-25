export function toUnicodeNotation(decimal: number) {
  return `U+${decimal.toString(16).toUpperCase().padStart(4, "0")}`;
}

export function isValidInventedValue(value: number) {
  return Number.isInteger(value) && value >= 0 && value <= 999999;
}
