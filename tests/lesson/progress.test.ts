import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  canAccessStep,
  clampStep,
  nextHighestUnlocked,
  resolveInitialSteps,
} from "../../lib/lesson/progress";

const STEP_COUNT = 8;

describe("clampStep", () => {
  it("keeps a step inside the unlocked range", () => {
    assert.equal(clampStep(3, 5, STEP_COUNT), 3);
    assert.equal(clampStep(9, 5, STEP_COUNT), 5);
    assert.equal(clampStep(-4, 5, STEP_COUNT), 0);
  });

  it("never returns a step past the end of the lesson", () => {
    assert.equal(clampStep(99, 99, STEP_COUNT), STEP_COUNT - 1);
  });

  it("rounds fractional requests rather than producing a half screen", () => {
    assert.equal(clampStep(2.4, 5, STEP_COUNT), 2);
    assert.equal(clampStep(2.6, 5, STEP_COUNT), 3);
  });
});

describe("canAccessStep", () => {
  it("allows revisiting any unlocked screen", () => {
    assert.equal(canAccessStep(0, 3), true);
    assert.equal(canAccessStep(3, 3), true);
  });

  it("refuses future and negative screens", () => {
    assert.equal(canAccessStep(4, 3), false);
    assert.equal(canAccessStep(-1, 3), false);
  });
});

describe("resolveInitialSteps — the progression contract", () => {
  it("starts a new learner at the first screen", () => {
    assert.deepEqual(
      resolveInitialSteps({ savedCurrentStep: undefined, savedHighestUnlocked: undefined, requestedStep: null, stepCount: STEP_COUNT }),
      { currentStep: 0, highestUnlocked: 0 },
    );
  });

  it("restores where the learner was", () => {
    assert.deepEqual(
      resolveInitialSteps({ savedCurrentStep: 2, savedHighestUnlocked: 4, requestedStep: null, stepCount: STEP_COUNT }),
      { currentStep: 2, highestUnlocked: 4 },
    );
  });

  it("lets the URL choose any screen the learner has already reached", () => {
    const resolved = resolveInitialSteps({ savedCurrentStep: 4, savedHighestUnlocked: 4, requestedStep: 1, stepCount: STEP_COUNT });
    assert.equal(resolved.currentStep, 1);
    assert.equal(resolved.highestUnlocked, 4, "rewinding must not discard progress");
  });

  it("refuses to let a hand-edited URL unlock a future screen", () => {
    const resolved = resolveInitialSteps({ savedCurrentStep: 1, savedHighestUnlocked: 2, requestedStep: 7, stepCount: STEP_COUNT });
    assert.equal(resolved.currentStep, 2, "a skipped-ahead request lands on the furthest genuine progress");
    assert.equal(resolved.highestUnlocked, 2);
  });

  it("refuses to let tampered storage unlock a screen past the lesson", () => {
    const resolved = resolveInitialSteps({ savedCurrentStep: 400, savedHighestUnlocked: 400, requestedStep: 400, stepCount: STEP_COUNT });
    assert.deepEqual(resolved, { currentStep: STEP_COUNT - 1, highestUnlocked: STEP_COUNT - 1 });
  });

  it("survives corrupted persisted values", () => {
    assert.deepEqual(
      resolveInitialSteps({ savedCurrentStep: "3", savedHighestUnlocked: null, requestedStep: null, stepCount: STEP_COUNT }),
      { currentStep: 0, highestUnlocked: 0 },
    );
  });

  it("ignores a negative URL request", () => {
    const resolved = resolveInitialSteps({ savedCurrentStep: 3, savedHighestUnlocked: 3, requestedStep: -2, stepCount: STEP_COUNT });
    assert.equal(resolved.currentStep, 0);
  });
});

describe("nextHighestUnlocked", () => {
  it("moves progress forward", () => {
    assert.equal(nextHighestUnlocked(2, 3, STEP_COUNT), 3);
  });

  it("never moves progress backwards when an earlier screen is replayed", () => {
    assert.equal(nextHighestUnlocked(5, 1, STEP_COUNT), 5);
  });

  it("stops at the final screen", () => {
    assert.equal(nextHighestUnlocked(7, 40, STEP_COUNT), STEP_COUNT - 1);
  });
});
