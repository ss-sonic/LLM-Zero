export function asciiValue(character: string): number | null {
  const value = character.codePointAt(0);
  if (value === undefined || value > 127) return null;
  return value;
}

export function isAscii(character: string) {
  return asciiValue(character) !== null;
}

export function canAsciiRepresent(text: string) {
  return Array.from(text).every(isAscii);
}

export function displayCharacter(character: string) {
  return character === " " ? "␠" : character;
}
