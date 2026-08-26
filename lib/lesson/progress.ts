export function clampStep(value: number, highestUnlocked: number, stepCount: number) {
  const lastStep = Math.max(0, stepCount - 1);
  const safeHighest = Math.max(0, Math.min(Math.round(highestUnlocked), lastStep));
  return Math.min(Math.max(Math.round(value), 0), safeHighest);
}

export function canAccessStep(step: number, highestUnlocked: number) {
  return step >= 0 && step <= highestUnlocked;
}

/**
 * The whole progression contract in one pure function, so it can be tested
 * instead of trusted.
 *
 * A learner may reopen a lesson at any screen they have genuinely reached, and
 * the URL decides *where they are* — but it can never decide *how far they got*.
 * `highestUnlocked` therefore comes only from persisted progress, and a
 * requested step is clamped against it. Hand-editing `?step=` can rewind, never
 * skip ahead.
 */
export function resolveInitialSteps({
  savedCurrentStep,
  savedHighestUnlocked,
  requestedStep,
  stepCount,
}: {
  savedCurrentStep: unknown;
  savedHighestUnlocked: unknown;
  requestedStep: number | null;
  stepCount: number;
}) {
  const highestUnlocked = clampStep(
    typeof savedHighestUnlocked === "number" ? savedHighestUnlocked : 0,
    stepCount - 1,
    stepCount,
  );
  const fallbackStep = typeof savedCurrentStep === "number" ? savedCurrentStep : 0;
  const currentStep = clampStep(requestedStep ?? fallbackStep, highestUnlocked, stepCount);

  return { currentStep, highestUnlocked };
}

/** Unlocking is monotonic: progress is never lost by revisiting an earlier screen. */
export function nextHighestUnlocked(current: number, requested: number, stepCount: number) {
  return Math.min(stepCount - 1, Math.max(current, requested));
}
