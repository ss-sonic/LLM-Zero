import type { LessonMeta } from "./types";
import {
  CHARACTER_REPRESENTATION_STEPS,
  CHARACTER_REPRESENTATION_STORAGE_KEY,
} from "./01-character-representation/config";
import {
  SHARED_CHARACTER_TABLE_STEPS,
  SHARED_CHARACTER_TABLE_STORAGE_KEY,
} from "./02-shared-character-table/config";
import {
  ASCII_STEPS,
  ASCII_STORAGE_KEY,
} from "./03-ascii/config";
import {
  BREAK_ASCII_STEPS,
  BREAK_ASCII_STORAGE_KEY,
} from "./04-breaking-ascii/config";
import {
  UNICODE_CODE_POINT_STEPS,
  UNICODE_CODE_POINT_STORAGE_KEY,
} from "./05-unicode-code-points/config";
import {
  CODE_POINTS_VS_BYTES_STEPS,
  CODE_POINTS_VS_BYTES_STORAGE_KEY,
} from "./06-code-points-vs-bytes/config";

export const LESSONS: LessonMeta[] = [
  {
    number: 1,
    slug: "character-representation",
    title: "How computers represent text",
    question: "How can the letter A exist inside a computer?",
    description: "Build the bridge from a human-visible symbol to a number and then to bits.",
    module: "Text becomes data",
    status: "available",
    progress: { storageKey: CHARACTER_REPRESENTATION_STORAGE_KEY, stepCount: CHARACTER_REPRESENTATION_STEPS.length },
  },
  {
    number: 2,
    slug: "shared-character-table",
    title: "Why computers need a shared character table",
    question: "What if every computer invents its own table?",
    description: "Experience why communication breaks when two machines disagree about what a number means.",
    module: "Text becomes data",
    status: "available",
    progress: { storageKey: SHARED_CHARACTER_TABLE_STORAGE_KEY, stepCount: SHARED_CHARACTER_TABLE_STEPS.length },
  },
  {
    number: 3,
    slug: "ascii",
    title: "ASCII",
    question: "How did early computers agree on the same characters?",
    description: "Discover ASCII as a published character-number standard, inspect its structure, and find the boundary of its 128 values.",
    module: "Text becomes data",
    status: "available",
    progress: { storageKey: ASCII_STORAGE_KEY, stepCount: ASCII_STEPS.length },
  },
  {
    number: 4,
    slug: "breaking-ascii",
    title: "Break ASCII",
    question: "What happens when text needs characters ASCII does not contain?",
    description: "Break ASCII deliberately, reject private mapping fixes, and discover why global text needs a much larger shared character repertoire.",
    module: "Text becomes data",
    status: "available",
    progress: { storageKey: BREAK_ASCII_STORAGE_KEY, stepCount: BREAK_ASCII_STEPS.length },
  },
  {
    number: 5,
    slug: "unicode",
    title: "Unicode and code points",
    question: "How can one system give global text stable numeric identities?",
    description: "Discover code points as positions in a global character system, meet Unicode, read U+ notation, and keep identity separate from storage.",
    module: "Text becomes data",
    status: "available",
    progress: { storageKey: UNICODE_CODE_POINT_STORAGE_KEY, stepCount: UNICODE_CODE_POINT_STEPS.length },
  },
  {
    number: 6,
    slug: "code-points-vs-bytes",
    title: "A code point is not a byte",
    question: "If Unicode gives a character a number, what actually gets stored?",
    description: "Invent an encoding rule, prove code points do not determine bytes, and separate character identity from concrete storage.",
    module: "Text becomes data",
    status: "available",
    progress: { storageKey: CODE_POINTS_VS_BYTES_STORAGE_KEY, stepCount: CODE_POINTS_VS_BYTES_STEPS.length },
  },
  {
    number: 7,
    slug: "utf-8",
    title: "Build UTF-8 by hand",
    question: "How does a Unicode code point become real bytes?",
    description: "Construct UTF-8 byte sequences and inspect their bits directly.",
    module: "Text becomes data",
    status: "coming-soon",
  },
  {
    number: 8,
    slug: "utf-encodings",
    title: "UTF-8 vs UTF-16 vs UTF-32",
    question: "Why is there more than one way to encode Unicode?",
    description: "Compare storage, compatibility, and design tradeoffs between common Unicode encodings.",
    module: "Text becomes data",
    status: "coming-soon",
  },
];

export function getLessonMeta(slug: string) {
  return LESSONS.find((lesson) => lesson.slug === slug);
}
