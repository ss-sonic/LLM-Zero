import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { REPOSITORY_URL, lessonFeedbackUrl } from "../../lib/course/feedback";

const SCREEN = {
  lessonSlug: "ascii",
  lessonTitle: "ASCII: one shared character standard",
  stepNumber: 6,
  stepCount: 8,
  stepLabel: "Encode CAT",
};

describe("lesson feedback link", () => {
  it("points at the project's issue form", () => {
    const url = new URL(lessonFeedbackUrl(SCREEN));
    assert.equal(`${url.origin}${url.pathname}`, `${REPOSITORY_URL}/issues/new`);
    assert.equal(url.searchParams.get("template"), "lesson-feedback.yml");
    assert.equal(url.searchParams.get("labels"), "learner-feedback");
  });

  it("identifies the exact screen so the reporter only has to describe the confusion", () => {
    const url = new URL(lessonFeedbackUrl(SCREEN));
    assert.equal(url.searchParams.get("screen"), "ASCII: one shared character standard — screen 6 of 8: Encode CAT");
    assert.equal(url.searchParams.get("url"), "/lessons/ascii?step=6");
    assert.match(url.searchParams.get("title") ?? "", /Encode CAT/);
  });

  it("escapes titles and labels rather than breaking the link", () => {
    const url = new URL(lessonFeedbackUrl({
      ...SCREEN,
      lessonTitle: "A code point is not a byte & other lies",
      stepLabel: "Invent one equation (N = B₁ × 65,536 + …)",
    }));
    assert.match(url.searchParams.get("screen") ?? "", /B₁ × 65,536/);
    assert.equal(url.searchParams.get("labels"), "learner-feedback", "an ampersand must not spill into the next parameter");
  });
});
