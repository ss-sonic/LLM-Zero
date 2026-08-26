"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { readStepFromUrl, writeStepToUrl, type HistoryMode } from "./navigation";
import {
  clearPersistedLessonState,
  readPersistedLessonState,
  writePersistedLessonState,
} from "./persistence";
import { clampStep, nextHighestUnlocked, resolveInitialSteps } from "./progress";

export type LessonProgressController = {
  /** False until persisted state has been read; lessons render a placeholder shell until then. */
  hasHydrated: boolean;
  currentStep: number;
  highestUnlocked: number;
  /** Mark a screen reachable without navigating to it. */
  unlock: (step: number) => void;
  /** Navigate to an already-unlocked screen. Requests beyond `highestUnlocked` are ignored. */
  goTo: (step: number, mode?: HistoryMode) => void;
  unlockAndGo: (step: number) => void;
  back: () => void;
  restart: () => void;
};

/**
 * The guided-lesson state machine, owned in one place.
 *
 * Every lesson needs the same seven behaviours — hydrate, clamp, unlock, navigate,
 * persist, survive Back/Forward, and replay — and each lesson re-implementing them
 * meant the progression contract in `skills.md` was only as strong as the most
 * recent copy-paste. The rules themselves live in `progress.ts` as pure functions
 * so they can be tested; this hook is the React binding around them.
 *
 * Lesson-specific state stays with the lesson: it is passed in as `lessonState`
 * and handed back through `onRestore`, so the persisted blob keeps its existing
 * shape and learners do not lose progress.
 */
export function useLessonProgress<TSaved extends object>({
  storageKey,
  stepCount,
  lessonState,
  onRestore,
  onReset,
}: {
  storageKey: string;
  stepCount: number;
  lessonState: object;
  onRestore: (saved: Partial<TSaved> | null) => void;
  onReset: () => void;
}): LessonProgressController {
  const [hasHydrated, setHasHydrated] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [highestUnlocked, setHighestUnlocked] = useState(0);

  // Callbacks are written inline by lessons, so read them through refs rather
  // than making them effect dependencies.
  const onRestoreRef = useRef(onRestore);
  onRestoreRef.current = onRestore;
  const onResetRef = useRef(onReset);
  onResetRef.current = onReset;
  const lessonStateRef = useRef(lessonState);
  lessonStateRef.current = lessonState;

  useEffect(() => {
    const saved = readPersistedLessonState<TSaved & { currentStep?: number; highestUnlocked?: number }>(storageKey);
    const resolved = resolveInitialSteps({
      savedCurrentStep: saved?.currentStep,
      savedHighestUnlocked: saved?.highestUnlocked,
      requestedStep: readStepFromUrl(),
      stepCount,
    });

    setHighestUnlocked(resolved.highestUnlocked);
    setCurrentStep(resolved.currentStep);
    onRestoreRef.current(saved);
    writeStepToUrl(resolved.currentStep, "replace");
    setHasHydrated(true);
  }, [storageKey, stepCount]);

  const serializedLessonState = JSON.stringify(lessonState);

  useEffect(() => {
    if (!hasHydrated) return;
    writePersistedLessonState(storageKey, {
      ...lessonStateRef.current,
      currentStep,
      highestUnlocked,
    });
    // `serializedLessonState` stands in for the lesson's own state: it changes
    // exactly when something worth persisting changed.
  }, [hasHydrated, storageKey, currentStep, highestUnlocked, serializedLessonState]);

  useEffect(() => {
    if (!hasHydrated) return;

    function handlePopState() {
      const requested = readStepFromUrl();
      if (requested === null) return;

      // Back/Forward is still just a step request, so it is clamped like any other.
      const safeStep = clampStep(requested, highestUnlocked, stepCount);
      setCurrentStep(safeStep);
      if (safeStep !== requested) writeStepToUrl(safeStep, "replace");
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [hasHydrated, highestUnlocked, stepCount]);

  const unlock = useCallback((step: number) => {
    setHighestUnlocked((current) => nextHighestUnlocked(current, step, stepCount));
  }, [stepCount]);

  const goTo = useCallback((step: number, mode: HistoryMode = "push") => {
    if (step < 0 || step > highestUnlocked) return;
    setCurrentStep(step);
    if (hasHydrated) writeStepToUrl(step, mode);
  }, [hasHydrated, highestUnlocked]);

  const unlockAndGo = useCallback((step: number) => {
    const safe = Math.max(0, Math.min(stepCount - 1, step));
    unlock(safe);
    setCurrentStep(safe);
    if (hasHydrated) writeStepToUrl(safe, "push");
  }, [hasHydrated, stepCount, unlock]);

  const back = useCallback(() => {
    goTo(Math.max(0, currentStep - 1));
  }, [currentStep, goTo]);

  const restart = useCallback(() => {
    setCurrentStep(0);
    setHighestUnlocked(0);
    onResetRef.current();
    clearPersistedLessonState(storageKey);
    if (hasHydrated) writeStepToUrl(0, "replace");
  }, [hasHydrated, storageKey]);

  return { hasHydrated, currentStep, highestUnlocked, unlock, goTo, unlockAndGo, back, restart };
}
