/**
 * UTF-8, written out the way the lesson derives it.
 *
 * Every value here is the consequence of one design chain the learner walks
 * through: ASCII must stay valid, so a one-byte character is `0xxxxxxx`; nothing
 * multi-byte may collide with that, so its bytes all start with 1; a reader must
 * tell a first byte from a middle byte, so continuations are `10` and leads are
 * `11`; and the number of leading 1s says how many bytes the character occupies.
 *
 * Kept separate from the screens so it can be checked against the platform's own
 * encoder rather than against our reading of the spec.
 */

export const MAX_CODE_POINT = 0x10ffff;

const SURROGATE_START = 0xd800;
const SURROGATE_END = 0xdfff;

export type Utf8Form = {
  bytes: number;
  /** The bits that open the first byte. Its run of 1s is the byte count. */
  leadPrefix: string;
  /** Free bits in each byte, first byte first. */
  payloadBits: number[];
  min: number;
  max: number;
};

export const UTF8_FORMS: Utf8Form[] = [
  { bytes: 1, leadPrefix: "0", payloadBits: [7], min: 0x0000, max: 0x007f },
  { bytes: 2, leadPrefix: "110", payloadBits: [5, 6], min: 0x0080, max: 0x07ff },
  { bytes: 3, leadPrefix: "1110", payloadBits: [4, 6, 6], min: 0x0800, max: 0xffff },
  { bytes: 4, leadPrefix: "11110", payloadBits: [3, 6, 6, 6], min: 0x10000, max: MAX_CODE_POINT },
];

export const CONTINUATION_PREFIX = "10";

export type ByteRole = "single" | "continuation" | "lead" | "invalid";

export function totalPayloadBits(form: Utf8Form) {
  return form.payloadBits.reduce((total, width) => total + width, 0);
}

/**
 * Surrogate code points are excluded because they are not Unicode scalar values.
 * Why that carve-out exists at all is a UTF-16 story, and belongs to Lesson 08.
 */
export function isScalarValue(codePoint: number) {
  return Number.isInteger(codePoint)
    && codePoint >= 0
    && codePoint <= MAX_CODE_POINT
    && !(codePoint >= SURROGATE_START && codePoint <= SURROGATE_END);
}

export function formForCodePoint(codePoint: number) {
  if (!isScalarValue(codePoint)) return null;
  return UTF8_FORMS.find((form) => codePoint >= form.min && codePoint <= form.max) ?? null;
}

export function toBinary(value: number, width: number) {
  return value.toString(2).padStart(width, "0");
}

export function toHexByte(value: number) {
  return value.toString(16).toUpperCase().padStart(2, "0");
}

/** The code point's own bits, padded to exactly the room its form provides. */
export function payloadBitsFor(codePoint: number) {
  const form = formForCodePoint(codePoint);
  if (!form) return null;
  return toBinary(codePoint, totalPayloadBits(form));
}

/** The payload sliced the way the form divides it, before any tags are added. */
export function payloadSlicesFor(codePoint: number) {
  const form = formForCodePoint(codePoint);
  const bits = payloadBitsFor(codePoint);
  if (!form || bits === null) return null;

  const slices: string[] = [];
  let offset = 0;
  for (const width of form.payloadBits) {
    slices.push(bits.slice(offset, offset + width));
    offset += width;
  }
  return slices;
}

export function tagFor(form: Utf8Form, index: number) {
  return index === 0 ? form.leadPrefix : CONTINUATION_PREFIX;
}

export function encodeCodePoint(codePoint: number): number[] | null {
  const form = formForCodePoint(codePoint);
  const slices = payloadSlicesFor(codePoint);
  if (!form || !slices) return null;

  return slices.map((slice, index) => parseInt(`${tagFor(form, index)}${slice}`, 2));
}

export function encodeText(text: string) {
  const bytes: number[] = [];
  for (const character of text) {
    const encoded = encodeCodePoint(character.codePointAt(0) ?? 0);
    if (encoded) bytes.push(...encoded);
  }
  return bytes;
}

export function classifyByte(byte: number): ByteRole {
  if (!Number.isInteger(byte) || byte < 0 || byte > 0xff) return "invalid";
  if (byte < 0b1000_0000) return "single";
  if (byte < 0b1100_0000) return "continuation";
  if (byte < 0b1111_1000) return "lead";
  return "invalid";
}

/** How many bytes a first byte claims, read off its run of leading 1s. */
export function sequenceLength(byte: number) {
  const role = classifyByte(byte);
  if (role === "single") return 1;
  if (role !== "lead") return null;

  const bits = toBinary(byte, 8);
  const ones = bits.length - bits.replace(/^1+/, "").length;
  return ones >= 2 && ones <= 4 ? ones : null;
}

/**
 * Groups a byte stream into characters using only the tags.
 *
 * This is the property the lesson is really about: the split needs no length
 * table, no separators and no context, which is why a reader that joins a stream
 * halfway can still find where the next character starts.
 */
export function splitIntoCharacters(bytes: number[]): number[][] | null {
  const groups: number[][] = [];
  let index = 0;

  while (index < bytes.length) {
    const length = sequenceLength(bytes[index]);
    if (length === null) return null;
    if (index + length > bytes.length) return null;

    const group = bytes.slice(index, index + length);
    if (group.slice(1).some((byte) => classifyByte(byte) !== "continuation")) return null;

    groups.push(group);
    index += length;
  }

  return groups;
}

export function decodeCharacter(group: number[]): number | null {
  const length = sequenceLength(group[0]);
  if (length === null || length !== group.length) return null;

  const form = UTF8_FORMS.find((entry) => entry.bytes === length);
  if (!form) return null;

  const bits = group
    .map((byte, index) => toBinary(byte, 8).slice(tagFor(form, index).length))
    .join("");
  const codePoint = parseInt(bits, 2);

  // An overlong sequence spells a small number using more bytes than it needs.
  // It decodes to the same character, which is exactly why the standard forbids
  // it: one character must have one encoding, or the round trip stops being one.
  return codePoint >= form.min && isScalarValue(codePoint) ? codePoint : null;
}

export function decodeBytes(bytes: number[]): number[] | null {
  const groups = splitIntoCharacters(bytes);
  if (!groups) return null;

  const codePoints = groups.map(decodeCharacter);
  return codePoints.every((codePoint): codePoint is number => codePoint !== null) ? codePoints : null;
}

export function decodeToText(bytes: number[]) {
  const codePoints = decodeBytes(bytes);
  return codePoints ? codePoints.map((codePoint) => String.fromCodePoint(codePoint)).join("") : null;
}
