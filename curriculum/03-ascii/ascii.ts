export function asciiCode(character: string) {
  const code = character.codePointAt(0);
  if (code === undefined || code < 0 || code > 127) return null;
  return code;
}

export function encodeAscii(text: string) {
  const values: number[] = [];
  const unsupported: string[] = [];

  for (const character of Array.from(text)) {
    const code = asciiCode(character);
    if (code === null) unsupported.push(character);
    else values.push(code);
  }

  return { values, unsupported };
}

export function toSevenBit(value: number) {
  return Math.max(0, Math.min(127, Math.round(value))).toString(2).padStart(7, "0");
}

export function toByteBinary(value: number) {
  return Math.max(0, Math.min(255, Math.round(value))).toString(2).padStart(8, "0");
}

export function printableAscii(value: number) {
  if (value === 32) return "space";
  if (value >= 33 && value <= 126) return String.fromCharCode(value);
  if (value === 127) return "DEL";
  return "control";
}
