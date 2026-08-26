import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { getCourseProgressState } from "../../lib/course/progress";
import { writePersistedLessonState } from "../../lib/lesson/persistence";
import type { LessonMeta } from "../../curriculum/types";
import { clearBrowserStubs, installFakeStorage } from "../helpers/environment";

afterEach(clearBrowserStubs);

const LESSON: LessonMeta = {
  number: 3,
  slug: "ascii",
  title: "ASCII",
  question: "How did early computers agree on the same characters?",
  description: "…",
  module: "Text becomes data",
  status: "available",
  progress: { storageKey: "llm-zero:lesson:ascii:v1", stepCount: 8 },
};

describe("course progress state", () => {
  it("offers a start for an untouched lesson", () => {
    installFakeStorage();
    assert.equal(getCourseProgressState(LESSON), "start");
  });

  it("offers to continue a lesson in progress", () => {
    installFakeStorage();
    writePersistedLessonState(LESSON.progress!.storageKey, { currentStep: 2, highestUnlocked: 3 });
    assert.equal(getCourseProgressState(LESSON), "continue");
  });

  it("marks a lesson complete only once its final screen is unlocked", () => {
    installFakeStorage();
    writePersistedLessonState(LESSON.progress!.storageKey, { currentStep: 6, highestUnlocked: 6 });
    assert.equal(getCourseProgressState(LESSON), "continue");
    writePersistedLessonState(LESSON.progress!.storageKey, { currentStep: 7, highestUnlocked: 7 });
    assert.equal(getCourseProgressState(LESSON), "completed");
  });

  it("stays complete when a learner revisits an earlier screen", () => {
    installFakeStorage();
    writePersistedLessonState(LESSON.progress!.storageKey, { currentStep: 1, highestUnlocked: 7 });
    assert.equal(getCourseProgressState(LESSON), "completed");
  });

  it("treats a replayed lesson as a start again", () => {
    installFakeStorage();
    writePersistedLessonState(LESSON.progress!.storageKey, { currentStep: 7, highestUnlocked: 7 });
    assert.equal(getCourseProgressState(LESSON), "completed");

    // Replay clears the key and the harness immediately writes a zeroed blob back.
    writePersistedLessonState(LESSON.progress!.storageKey, { currentStep: 0, highestUnlocked: 0 });
    assert.equal(getCourseProgressState(LESSON), "start");
  });

  it("treats a lesson with no progress metadata as a start", () => {
    installFakeStorage();
    assert.equal(getCourseProgressState({ ...LESSON, status: "coming-soon", progress: undefined }), "start");
  });
});
