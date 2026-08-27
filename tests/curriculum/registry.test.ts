import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { LESSONS, getLessonMeta } from "../../curriculum/registry";
import { CHARACTER_REPRESENTATION_STEPS, CHARACTER_REPRESENTATION_STORAGE_KEY } from "../../curriculum/01-character-representation/config";
import { SHARED_CHARACTER_TABLE_STEPS, SHARED_CHARACTER_TABLE_STORAGE_KEY } from "../../curriculum/02-shared-character-table/config";
import { ASCII_STEPS, ASCII_STORAGE_KEY } from "../../curriculum/03-ascii/config";
import { BREAK_ASCII_STEPS, BREAK_ASCII_STORAGE_KEY } from "../../curriculum/04-breaking-ascii/config";
import { UNICODE_CODE_POINT_STEPS, UNICODE_CODE_POINT_STORAGE_KEY } from "../../curriculum/05-unicode-code-points/config";
import { CODE_POINTS_VS_BYTES_STEPS, CODE_POINTS_VS_BYTES_STORAGE_KEY } from "../../curriculum/06-code-points-vs-bytes/config";
import { HEXADECIMAL_BRIDGE_STEPS, HEXADECIMAL_BRIDGE_STORAGE_KEY } from "../../curriculum/06a-hexadecimal/config";
import { UTF_8_STEPS, UTF_8_STORAGE_KEY } from "../../curriculum/07-utf-8/config";
import { UTF_ENCODINGS_STEPS, UTF_ENCODINGS_STORAGE_KEY } from "../../curriculum/08-utf-encodings/config";
import { CHALLENGE_STEPS, CHALLENGE_STORAGE_KEY } from "../../curriculum/09-text-pipeline-challenge/config";

const LESSON_SOURCES = [
  { storageKey: CHARACTER_REPRESENTATION_STORAGE_KEY, steps: CHARACTER_REPRESENTATION_STEPS },
  { storageKey: SHARED_CHARACTER_TABLE_STORAGE_KEY, steps: SHARED_CHARACTER_TABLE_STEPS },
  { storageKey: ASCII_STORAGE_KEY, steps: ASCII_STEPS },
  { storageKey: BREAK_ASCII_STORAGE_KEY, steps: BREAK_ASCII_STEPS },
  { storageKey: UNICODE_CODE_POINT_STORAGE_KEY, steps: UNICODE_CODE_POINT_STEPS },
  { storageKey: CODE_POINTS_VS_BYTES_STORAGE_KEY, steps: CODE_POINTS_VS_BYTES_STEPS },
  { storageKey: HEXADECIMAL_BRIDGE_STORAGE_KEY, steps: HEXADECIMAL_BRIDGE_STEPS },
  { storageKey: UTF_8_STORAGE_KEY, steps: UTF_8_STEPS },
  { storageKey: UTF_ENCODINGS_STORAGE_KEY, steps: UTF_ENCODINGS_STEPS },
  { storageKey: CHALLENGE_STORAGE_KEY, steps: CHALLENGE_STEPS },
];

describe("curriculum registry", () => {
  it("keeps slugs, storage keys and numbers unique", () => {
    for (const field of ["slug", "number"] as const) {
      const values = LESSONS.map((lesson) => lesson[field]);
      assert.equal(new Set(values).size, values.length, `duplicate lesson ${field}`);
    }
    const keys = LESSON_SOURCES.map((source) => source.storageKey);
    assert.equal(new Set(keys).size, keys.length, "two lessons would overwrite each other's progress");
  });

  it("lists lessons in the order the curriculum builds them", () => {
    const numbers = LESSONS.map((lesson) => lesson.number);
    assert.deepEqual(numbers, [...numbers].sort((a, b) => a - b), "bottom-up sequencing is the point");
  });

  it("gives every available lesson the progress metadata the course map reads", () => {
    for (const lesson of LESSONS) {
      if (lesson.status !== "available") {
        assert.equal(lesson.progress, undefined, `${lesson.slug} is not written yet but claims progress`);
        continue;
      }
      assert.ok(lesson.progress, `${lesson.slug} is available but has no progress metadata`);
      const source = LESSON_SOURCES.find((entry) => entry.storageKey === lesson.progress!.storageKey);
      assert.ok(source, `${lesson.slug} points at a storage key no lesson config exports`);
      assert.equal(
        lesson.progress!.stepCount,
        source!.steps.length,
        `${lesson.slug} would never be marked complete: the registry and the lesson disagree about the step count`,
      );
    }
  });

  it("ends every lesson on a completion screen", () => {
    for (const source of LESSON_SOURCES) {
      assert.equal(source.steps.at(-1), "Complete", `${source.storageKey} does not end on a completion screen`);
    }
  });

  it("describes every lesson with the question it answers", () => {
    for (const lesson of LESSONS) {
      assert.ok(lesson.question.trim().endsWith("?"), `${lesson.slug} should lead with a question`);
      assert.ok(lesson.title.length > 0 && lesson.description.length > 0);
      assert.ok(lesson.module.length > 0, "every lesson belongs to a module on the north-star map");
    }
  });

  it("finds a lesson by slug and nothing by a slug that does not exist", () => {
    assert.equal(getLessonMeta("ascii")?.number, 3);
    assert.equal(getLessonMeta("attention"), undefined);
  });
});
