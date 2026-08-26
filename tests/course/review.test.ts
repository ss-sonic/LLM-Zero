import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DAY_MS,
  REVIEW_INTERVALS_DAYS,
  duePromptIds,
  eligiblePrompts,
  ensureScheduled,
  intervalForStage,
  isDue,
  nextDueAt,
  normalizeSchedule,
  recordReview,
  type ReviewSchedule,
} from "../../lib/course/review";
import {
  REVIEW_PROMPTS,
  REVIEW_PROMPT_IDS,
  getReviewPrompt,
  isConstructAnswerCorrect,
  normalizeConstructAnswer,
} from "../../curriculum/review";
import { LESSONS } from "../../curriculum/registry";

const NOW = 1_800_000_000_000;

describe("review scheduling", () => {
  it("expands the gap after each successful retrieval", () => {
    let schedule: ReviewSchedule = {};
    const gaps: number[] = [];
    let now = NOW;

    for (let round = 0; round < REVIEW_INTERVALS_DAYS.length + 2; round += 1) {
      schedule = recordReview(schedule, "p", true, now);
      gaps.push((schedule.p.dueAt - now) / DAY_MS);
      now = schedule.p.dueAt;
    }

    assert.deepEqual(gaps.slice(0, REVIEW_INTERVALS_DAYS.length - 1), [...REVIEW_INTERVALS_DAYS].slice(1));
    assert.equal(gaps.at(-1), REVIEW_INTERVALS_DAYS.at(-1), "the ladder tops out rather than growing forever");
  });

  it("sends a missed idea back to the shortest interval", () => {
    let schedule: ReviewSchedule = {};
    for (let round = 0; round < 4; round += 1) schedule = recordReview(schedule, "p", true, NOW);
    assert.ok(schedule.p.stage > 0);

    schedule = recordReview(schedule, "p", false, NOW);
    assert.equal(schedule.p.stage, 0);
    assert.equal(schedule.p.dueAt - NOW, REVIEW_INTERVALS_DAYS[0] * DAY_MS);
  });

  it("never schedules two ideas as one", () => {
    let schedule = recordReview({}, "a", true, NOW);
    schedule = recordReview(schedule, "b", false, NOW);
    assert.equal(schedule.a.stage, 1);
    assert.equal(schedule.b.stage, 0);
  });

  it("gives a newly finished lesson's ideas a first due date, and only once", () => {
    const seeded = ensureScheduled({}, ["a", "b"], NOW);
    assert.equal(seeded.a.dueAt, NOW + intervalForStage(0));
    assert.equal(seeded.b.stage, 0);

    const later = ensureScheduled(seeded, ["a", "b"], NOW + 5 * DAY_MS);
    assert.equal(later, seeded, "an untouched schedule is returned as-is");
    assert.equal(later.a.dueAt, NOW + intervalForStage(0), "an existing due date is never pushed back");
  });

  it("adds ideas from a lesson finished later without disturbing the others", () => {
    const first = ensureScheduled({}, ["a"], NOW);
    const second = ensureScheduled(first, ["a", "b"], NOW + 10 * DAY_MS);
    assert.equal(second.a.dueAt, first.a.dueAt);
    assert.equal(second.b.dueAt, NOW + 10 * DAY_MS + intervalForStage(0));
  });

  it("only surfaces ideas whose interval has elapsed, soonest first", () => {
    const schedule: ReviewSchedule = {
      late: { stage: 0, dueAt: NOW - DAY_MS },
      overdue: { stage: 0, dueAt: NOW - 5 * DAY_MS },
      future: { stage: 2, dueAt: NOW + DAY_MS },
    };
    assert.deepEqual(duePromptIds(schedule, ["late", "overdue", "future"], NOW), ["overdue", "late"]);
    assert.equal(isDue(schedule.future, NOW), false);
    assert.equal(isDue(undefined, NOW), false, "an unscheduled idea is not due");
  });

  it("ignores ideas from lessons that are not finished", () => {
    const schedule: ReviewSchedule = { a: { stage: 0, dueAt: NOW - DAY_MS }, b: { stage: 0, dueAt: NOW - DAY_MS } };
    assert.deepEqual(duePromptIds(schedule, ["a"], NOW), ["a"]);
  });

  it("reports when the next idea returns", () => {
    const schedule: ReviewSchedule = { a: { stage: 1, dueAt: NOW + 9 * DAY_MS }, b: { stage: 0, dueAt: NOW + 2 * DAY_MS } };
    assert.equal(nextDueAt(schedule, ["a", "b"]), NOW + 2 * DAY_MS);
    assert.equal(nextDueAt(schedule, []), null);
  });

  it("discards corrupted or stale stored entries instead of throwing", () => {
    const stored = {
      good: { stage: 2, dueAt: NOW },
      wrongShape: { stage: "soon" },
      removedPrompt: { stage: 1, dueAt: NOW },
    };
    assert.deepEqual(normalizeSchedule(stored, ["good", "wrongShape"]), { good: { stage: 2, dueAt: NOW } });
    assert.deepEqual(normalizeSchedule(null, ["good"]), {});
    assert.deepEqual(normalizeSchedule("nope", ["good"]), {});
  });
});

describe("review prompts", () => {
  it("keeps prompt ids unique and resolvable", () => {
    assert.equal(new Set(REVIEW_PROMPT_IDS).size, REVIEW_PROMPT_IDS.length);
    for (const id of REVIEW_PROMPT_IDS) assert.ok(getReviewPrompt(id), `${id} is not resolvable`);
  });

  it("attaches every prompt to a real, available lesson", () => {
    const available = new Set(LESSONS.filter((lesson) => lesson.status === "available").map((lesson) => lesson.slug));
    for (const prompt of REVIEW_PROMPTS) {
      assert.ok(available.has(prompt.lessonSlug), `${prompt.id} points at ${prompt.lessonSlug}`);
    }
  });

  it("gives every lesson at least one idea that comes back", () => {
    const covered = new Set(REVIEW_PROMPTS.map((prompt) => prompt.lessonSlug));
    for (const lesson of LESSONS.filter((entry) => entry.status === "available")) {
      assert.ok(covered.has(lesson.slug), `${lesson.slug} has nothing scheduled to return`);
    }
  });

  it("gives construct prompts a checkable answer and recall prompts none", () => {
    for (const prompt of REVIEW_PROMPTS) {
      const ends = prompt.question.trim().slice(-1);
      assert.ok(
        prompt.kind === "recall" ? ends === "?" : ends === "?" || ends === ".",
        `${prompt.id} should ask a question or give a task`,
      );
      assert.ok(prompt.principle.length > 40, `${prompt.id} needs a principle worth revealing`);
      if (prompt.kind === "construct") {
        assert.ok(prompt.answer, `${prompt.id} is a construction with no answer`);
        assert.ok(isConstructAnswerCorrect(prompt, prompt.answer!), `${prompt.id} rejects its own answer`);
      } else {
        assert.equal(prompt.answer, undefined, `${prompt.id} would machine-grade prose`);
      }
    }
  });

  it("never hands the answer back inside the question", () => {
    for (const prompt of REVIEW_PROMPTS) {
      if (prompt.kind !== "construct" || !prompt.answer) continue;
      const asked = normalizeConstructAnswer(`${prompt.question} ${prompt.context ?? ""}`);
      assert.ok(!asked.includes(normalizeConstructAnswer(prompt.answer)), `${prompt.id} contains its own answer`);
    }
  });

  it("forgives formatting but not a different value", () => {
    const decode = getReviewPrompt("l6-decode-rocket")!;
    assert.equal(isConstructAnswerCorrect(decode, " 128,640 "), true);
    assert.equal(isConstructAnswerCorrect(decode, "128640"), true);
    assert.equal(isConstructAnswerCorrect(decode, "12864"), false);
    assert.equal(isConstructAnswerCorrect(decode, ""), false);

    const hex = getReviewPrompt("f1-bits-to-hex")!;
    assert.equal(isConstructAnswerCorrect(hex, "f0"), true);
    assert.equal(isConstructAnswerCorrect(hex, "0xf0"), true);
    assert.equal(isConstructAnswerCorrect(hex, "F1"), false);
  });

  it("checks the answers the curriculum actually teaches", () => {
    assert.equal(getReviewPrompt("l3-ascii-t")!.answer, String("T".charCodeAt(0)));
    assert.equal(getReviewPrompt("l5-ascii-carryover")!.answer, String("A".codePointAt(0)));
    assert.equal(getReviewPrompt("l6-decode-rocket")!.answer, String("🚀".codePointAt(0)));
    assert.equal(getReviewPrompt("l1-stored-bits")!.answer, (65).toString(2).padStart(8, "0"));
    assert.equal(getReviewPrompt("f1-bits-to-hex")!.answer, (0b11110000).toString(16).toUpperCase());
    assert.equal(getReviewPrompt("f1-hex-to-bits")!.answer, (0x9f).toString(2).padStart(8, "0"));
  });
});

describe("eligibility", () => {
  it("only returns ideas from lessons the learner finished", () => {
    const completed = new Set(["ascii"]);
    const prompts = eligiblePrompts((slug) => completed.has(slug));
    assert.ok(prompts.length > 0);
    assert.ok(prompts.every((prompt) => prompt.lessonSlug === "ascii"));
  });

  it("returns nothing when no lesson is finished", () => {
    assert.deepEqual(eligiblePrompts(() => false), []);
  });
});
