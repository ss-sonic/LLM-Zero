"use client";

import { useEffect, useState } from "react";
import { LessonPlayer } from "../../components/lesson/LessonPlayer";
import { readStepFromUrl, writeStepToUrl } from "../../lib/lesson/navigation";
import {
  clearPersistedLessonState,
  readPersistedLessonState,
  writePersistedLessonState,
} from "../../lib/lesson/persistence";
import { clampStep } from "../../lib/lesson/progress";
import { BREAK_ASCII_STEPS, BREAK_ASCII_STORAGE_KEY, EXPANSION_AREAS, MIXED_TEXT, WORLD_SAMPLES } from "./config";
import { BiggerTableStep } from "./steps/BiggerTable";
import { CompleteStep } from "./steps/Complete";
import { MissingCharacterStep } from "./steps/MissingCharacter";
import { MixedChallengeStep } from "./steps/MixedChallenge";
import { PrivateFixStep } from "./steps/PrivateFix";
import { ProveAsciiStep } from "./steps/ProveAscii";
import { WorldTextStep } from "./steps/WorldText";
import type { RecallAssessment } from "../../components/ui/TextRecall";
import type {
  BiggerAnswer,
  BreakingAsciiPersistedState,
  MissingAnswer,
  MixedAnswer,
} from "./types";

const STEP_COUNT = BREAK_ASCII_STEPS.length;
const MIXED_LENGTH = Array.from(MIXED_TEXT).length;

function safeStringArray(value: unknown, allowed: readonly string[]) {
  if (!Array.isArray(value)) return [];
  return Array.from(new Set(value.filter((item): item is string => typeof item === "string" && allowed.includes(item))));
}

function safeMixedAnswers(value: unknown): MixedAnswer[] {
  if (!Array.isArray(value) || value.length !== MIXED_LENGTH) return Array.from({ length: MIXED_LENGTH }, () => null);
  return value.map((item) => item === "ascii" || item === "outside" ? item : null);
}

export function BreakingAsciiLesson() {
  const [hasHydrated, setHasHydrated] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [highestUnlocked, setHighestUnlocked] = useState(0);
  const [asciiProofSent, setAsciiProofSent] = useState(false);
  const [cafeTried, setCafeTried] = useState(false);
  const [missingAnswer, setMissingAnswer] = useState<MissingAnswer>(null);
  const [privateAssigned, setPrivateAssigned] = useState(false);
  const [privateSent, setPrivateSent] = useState(false);
  const [privateRecallText, setPrivateRecallText] = useState("");
  const [privateRecallCommitted, setPrivateRecallCommitted] = useState(false);
  const [privateRecallAssessment, setPrivateRecallAssessment] = useState<RecallAssessment>(null);
  const [worldSeenIds, setWorldSeenIds] = useState<string[]>([]);
  const [includedAreas, setIncludedAreas] = useState<string[]>([]);
  const [biggerAnswer, setBiggerAnswer] = useState<BiggerAnswer>(null);
  const [mixedAnswers, setMixedAnswers] = useState<MixedAnswer[]>(Array.from({ length: MIXED_LENGTH }, () => null));

  useEffect(() => {
    const saved = readPersistedLessonState<BreakingAsciiPersistedState>(BREAK_ASCII_STORAGE_KEY);
    const restoredHighest = clampStep(
      typeof saved?.highestUnlocked === "number" ? saved.highestUnlocked : 0,
      STEP_COUNT - 1,
      STEP_COUNT,
    );
    const requestedStep = readStepFromUrl();
    const restoredCurrent = clampStep(
      requestedStep ?? (typeof saved?.currentStep === "number" ? saved.currentStep : 0),
      restoredHighest,
      STEP_COUNT,
    );

    setCurrentStep(restoredCurrent);
    setHighestUnlocked(restoredHighest);
    setAsciiProofSent(saved?.asciiProofSent === true);
    setCafeTried(saved?.cafeTried === true);
    setMissingAnswer(saved?.missingAnswer === "hidden" || saved?.missingAnswer === "missing" || saved?.missingAnswer === "binary" ? saved.missingAnswer : null);
    setPrivateAssigned(saved?.privateAssigned === true);
    setPrivateSent(saved?.privateSent === true);
    // Learners who already cleared the old machine-graded check keep their progress;
    // anyone who was mid-attempt restarts the recall with a clean slate.
    const clearedLegacyCheck = saved?.privateFixAnswer === "agreement";
    setPrivateRecallText(typeof saved?.privateRecallText === "string" ? saved.privateRecallText : "");
    setPrivateRecallCommitted(saved?.privateRecallCommitted === true || clearedLegacyCheck);
    setPrivateRecallAssessment(
      saved?.privateRecallAssessment === "matched" || saved?.privateRecallAssessment === "missed"
        ? saved.privateRecallAssessment
        : clearedLegacyCheck
          ? "matched"
          : null,
    );
    setWorldSeenIds(safeStringArray(saved?.worldSeenIds, WORLD_SAMPLES.map((sample) => sample.id)));
    setIncludedAreas(safeStringArray(saved?.includedAreas, EXPANSION_AREAS));
    setBiggerAnswer(saved?.biggerAnswer === "private" || saved?.biggerAnswer === "shared" || saved?.biggerAnswer === "guess" ? saved.biggerAnswer : null);
    setMixedAnswers(safeMixedAnswers(saved?.mixedAnswers));
    writeStepToUrl(restoredCurrent, "replace");
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;
    const state: BreakingAsciiPersistedState = {
      currentStep,
      highestUnlocked,
      asciiProofSent,
      cafeTried,
      missingAnswer,
      privateAssigned,
      privateSent,
      privateRecallText,
      privateRecallCommitted,
      privateRecallAssessment,
      worldSeenIds,
      includedAreas,
      biggerAnswer,
      mixedAnswers,
    };
    writePersistedLessonState(BREAK_ASCII_STORAGE_KEY, state);
  }, [hasHydrated, currentStep, highestUnlocked, asciiProofSent, cafeTried, missingAnswer, privateAssigned, privateSent, privateRecallText, privateRecallCommitted, privateRecallAssessment, worldSeenIds, includedAreas, biggerAnswer, mixedAnswers]);

  useEffect(() => {
    if (!hasHydrated) return;
    function handlePopState() {
      const requested = readStepFromUrl();
      if (requested === null) return;
      const safeStep = clampStep(requested, highestUnlocked, STEP_COUNT);
      setCurrentStep(safeStep);
      if (safeStep !== requested) writeStepToUrl(safeStep, "replace");
    }
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [hasHydrated, highestUnlocked]);

  function unlock(step: number) {
    setHighestUnlocked((current) => Math.min(STEP_COUNT - 1, Math.max(current, step)));
  }

  function goTo(step: number, mode: "push" | "replace" = "push") {
    if (step < 0 || step > highestUnlocked) return;
    setCurrentStep(step);
    if (hasHydrated) writeStepToUrl(step, mode);
  }

  function unlockAndGo(step: number) {
    unlock(step);
    setCurrentStep(step);
    if (hasHydrated) writeStepToUrl(step, "push");
  }

  function restartLesson() {
    setCurrentStep(0);
    setHighestUnlocked(0);
    setAsciiProofSent(false);
    setCafeTried(false);
    setMissingAnswer(null);
    setPrivateAssigned(false);
    setPrivateSent(false);
    setPrivateRecallText("");
    setPrivateRecallCommitted(false);
    setPrivateRecallAssessment(null);
    setWorldSeenIds([]);
    setIncludedAreas([]);
    setBiggerAnswer(null);
    setMixedAnswers(Array.from({ length: MIXED_LENGTH }, () => null));
    clearPersistedLessonState(BREAK_ASCII_STORAGE_KEY);
    if (hasHydrated) writeStepToUrl(0, "replace");
  }

  if (!hasHydrated) return <main className="app-shell" aria-busy="true" />;

  let screen;
  switch (currentStep) {
    case 0:
      screen = <ProveAsciiStep sent={asciiProofSent} onSend={() => { setAsciiProofSent(true); unlock(1); }} onContinue={() => unlockAndGo(1)} />;
      break;
    case 1:
      screen = (
        <MissingCharacterStep
          tried={cafeTried}
          answer={missingAnswer}
          onTry={() => setCafeTried(true)}
          onAnswer={(answer) => { setMissingAnswer(answer); if (answer === "missing") unlock(2); }}
          onContinue={() => unlockAndGo(2)}
        />
      );
      break;
    case 2:
      screen = (
        <PrivateFixStep
          assigned={privateAssigned}
          sent={privateSent}
          recallText={privateRecallText}
          recallCommitted={privateRecallCommitted}
          recallAssessment={privateRecallAssessment}
          onAssign={() => setPrivateAssigned(true)}
          onSend={() => setPrivateSent(true)}
          onRecallChange={setPrivateRecallText}
          onRecallCommit={() => setPrivateRecallCommitted(true)}
          onRecallAssess={(assessment) => { setPrivateRecallAssessment(assessment); unlock(3); }}
          onRecallRewrite={() => { setPrivateRecallCommitted(false); setPrivateRecallAssessment(null); }}
          onContinue={() => unlockAndGo(3)}
        />
      );
      break;
    case 3:
      screen = (
        <WorldTextStep
          seenIds={worldSeenIds}
          onInspect={(id) => setWorldSeenIds((current) => current.includes(id) ? current : [...current, id])}
          onContinue={() => unlockAndGo(4)}
        />
      );
      break;
    case 4:
      screen = (
        <BiggerTableStep
          includedAreas={includedAreas}
          answer={biggerAnswer}
          onToggleArea={(area) => setIncludedAreas((current) => current.includes(area) ? current.filter((item) => item !== area) : [...current, area])}
          onAnswer={(answer) => { setBiggerAnswer(answer); if (answer === "shared") unlock(5); }}
          onContinue={() => unlockAndGo(5)}
        />
      );
      break;
    case 5:
      screen = (
        <MixedChallengeStep
          answers={mixedAnswers}
          onAnswer={(index, answer) => setMixedAnswers((current) => current.map((item, itemIndex) => itemIndex === index ? answer : item))}
          onFinish={() => unlockAndGo(6)}
        />
      );
      break;
    default:
      screen = <CompleteStep onRestart={restartLesson} />;
  }

  return (
    <LessonPlayer
      lessonNumber={4}
      title="Break ASCII: when the table is too small"
      stepLabels={BREAK_ASCII_STEPS}
      currentStep={currentStep}
      highestUnlocked={highestUnlocked}
      onNavigate={(step) => goTo(step)}
      onBack={() => goTo(Math.max(0, currentStep - 1))}
      onRestart={restartLesson}
    >
      {screen}
    </LessonPlayer>
  );
}
