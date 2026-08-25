export function clampStep(value: number, highestUnlocked: number, stepCount: number) {
  const lastStep = Math.max(0, stepCount - 1);
  const safeHighest = Math.max(0, Math.min(Math.round(highestUnlocked), lastStep));
  return Math.min(Math.max(Math.round(value), 0), safeHighest);
}

export function canAccessStep(step: number, highestUnlocked: number) {
  return step >= 0 && step <= highestUnlocked;
}
