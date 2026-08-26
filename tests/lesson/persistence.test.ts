import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import {
  clearPersistedLessonState,
  lessonStorageKey,
  readPersistedLessonState,
  writePersistedLessonState,
} from "../../lib/lesson/persistence";
import { clearBrowserStubs, installFakeStorage } from "../helpers/environment";

afterEach(clearBrowserStubs);

type Saved = { currentStep: number; highestUnlocked: number; answer: string | null };

describe("lesson persistence", () => {
  it("round-trips lesson state", () => {
    installFakeStorage();
    const key = lessonStorageKey("ascii");
    writePersistedLessonState<Saved>(key, { currentStep: 3, highestUnlocked: 4, answer: "published" });
    assert.deepEqual(readPersistedLessonState<Saved>(key), { currentStep: 3, highestUnlocked: 4, answer: "published" });
  });

  it("namespaces keys per lesson and version", () => {
    assert.equal(lessonStorageKey("ascii"), "llm-zero:lesson:ascii:v1");
    assert.equal(lessonStorageKey("ascii", 2), "llm-zero:lesson:ascii:v2");
  });

  it("returns null for a lesson that has never been opened", () => {
    installFakeStorage();
    assert.equal(readPersistedLessonState("llm-zero:lesson:none:v1"), null);
  });

  it("returns null rather than throwing on corrupted JSON", () => {
    const store = installFakeStorage();
    store.set("llm-zero:lesson:ascii:v1", "{not json");
    assert.equal(readPersistedLessonState("llm-zero:lesson:ascii:v1"), null);
  });

  it("returns null when the stored value is not an object", () => {
    const store = installFakeStorage();
    store.set("llm-zero:lesson:ascii:v1", "42");
    assert.equal(readPersistedLessonState("llm-zero:lesson:ascii:v1"), null);
  });

  it("clears a lesson so replay really starts over", () => {
    const store = installFakeStorage();
    writePersistedLessonState("llm-zero:lesson:ascii:v1", { currentStep: 5 });
    clearPersistedLessonState("llm-zero:lesson:ascii:v1");
    assert.equal(store.has("llm-zero:lesson:ascii:v1"), false);
  });

  it("stays usable when storage is unavailable, as in a private window", () => {
    installFakeStorage({ throwOnAccess: true });
    assert.doesNotThrow(() => writePersistedLessonState("llm-zero:lesson:ascii:v1", { currentStep: 1 }));
    assert.doesNotThrow(() => clearPersistedLessonState("llm-zero:lesson:ascii:v1"));
    assert.equal(readPersistedLessonState("llm-zero:lesson:ascii:v1"), null);
  });
});
