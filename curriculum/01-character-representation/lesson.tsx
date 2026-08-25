"use client";

import { useEffect, useMemo, useState } from "react";
import { LessonPlayer } from "../../components/lesson/LessonPlayer";
import { emptyByte, isBitArray, toBits } from "../../lib/lesson/binary";
import { readStepFromUrl, writeStepToUrl } from "../../lib/lesson/navigation";
import {
  clearPersistedLessonState,
  readPersistedLessonState,
  writePersistedLessonState,
} from "../../lib/lesson/persistence";
import { clampStep } from "../../lib/lesson/progress";
import {
  CHARACTER_REPRESENTATION_STEPS,
  CHARACTER_REPRESENTATION_STORAGE_KEY,
} from "./config";
import { BinaryStep } from "./steps/Binary";
import { BreakAgreementStep } from "./steps/BreakAgreement";
import { CompleteStep } from "./steps/Complete";
import { FinalCheckStep } from "./steps/FinalCheck";
import { InventRuleStep } from "./steps/InventRule";
import { MysteryStep } from "./steps/Mystery";
import { QuestionRuleStep } from "./steps/QuestionRule";
import type {
  BitPhase,
  CharacterRepresentationPersistedState,
  ConventionAnswer,
  FinalAnswer,
} from "./types";

const STEP_COUNT = CHARACTER_REPRESENTATION_STEPS.length;

export function CharacterRepresentationLesson() {
  const [hasHydrated, setHasHydrated] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [highestUnlocked, setHighestUnlocked] = useState(0);
  const [introGuess, setIntroGuess] = useState<string | null>(null);
  const [numberDraft, setNumberDraft] = useState("65");
  const [agreedNumber, setAgreedNumber] = useState(65);
  const [conventionAnswer, setConventionAnswer] = useState<ConventionAnswer>(null);
  const [sendRevealed, setSendRevealed] = useState(false);
  const [labBits, setLabBits] = useState<string[]>(() => emptyByte());
  const [bitPhase, setBitPhase] = useState<BitPhase>("build");
  const [hasFlippedBit, setHasFlippedBit] = useState(false);
  const [finalAnswer, setFinalAnswer] = useState<FinalAnswer>(null);

  const targetBits = useMemo(() => toBits(agreedNumber), [agreedNumber]);

  useEffect(() => {
    const saved = readPersistedLessonState<CharacterRepresentationPersistedState>(
      CHARACTER_REPRESENTATION_STORAGE_KEY,
    );
    const restoredHighest = clampStep(
      typeof saved?.highestUnlocked === "number" ? saved.highestUnlocked : 0,
      STEP_COUNT - 1,
      STEP_COUNT,
    );
    const restoredAgreedNumber = Math.max(
      0,
      Math.min(255, Math.round(typeof saved?.agreedNumber === "number" ? saved.agreedNumber : 65)),
    );
    const requestedStep = readStepFromUrl();
    const restoredCurrent = clampStep(
      requestedStep ?? (typeof saved?.currentStep === "number" ? saved.currentStep : 0),
      restoredHighest,
      STEP_COUNT,
    );

    setHighestUnlocked(restoredHighest);
    setCurrentStep(restoredCurrent);
    setIntroGuess(typeof saved?.introGuess === "string" ? saved.introGuess : null);
    setNumberDraft(typeof saved?.numberDraft === "string" ? saved.numberDraft : String(restoredAgreedNumber));
    setAgreedNumber(restoredAgreedNumber);
    setConventionAnswer(saved?.conventionAnswer === "yes" || saved?.conventionAnswer === "no" ? saved.conventionAnswer : null);
    setSendRevealed(saved?.sendRevealed === true);
    setLabBits(isBitArray(saved?.labBits) ? saved.labBits : emptyByte());
    setBitPhase(saved?.bitPhase === "explain" || saved?.bitPhase === "play" ? saved.bitPhase : "build");
    setHasFlippedBit(saved?.hasFlippedBit === true);
    setFinalAnswer(
      saved?.finalAnswer === "letter" || saved?.finalAnswer === "representation"
        ? saved.finalAnswer
        : null,
    );
    writeStepToUrl(restoredCurrent, "replace");
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;

    const state: CharacterRepresentationPersistedState = {
      currentStep,
      highestUnlocked,
      introGuess,
      numberDraft,
      agreedNumber,
      conventionAnswer,
      sendRevealed,
      labBits,
      bitPhase,
      hasFlippedBit,
      finalAnswer,
    };

    writePersistedLessonState(CHARACTER_REPRESENTATION_STORAGE_KEY, state);
  }, [
    hasHydrated,
    currentStep,
    highestUnlocked,
    introGuess,
    numberDraft,
    agreedNumber,
    conventionAnswer,
    sendRevealed,
    labBits,
    bitPhase,
    hasFlippedBit,
    finalAnswer,
  ]);

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

  function commitNumber() {
    const parsed = Number(numberDraft);
    if (!Number.isFinite(parsed)) return;

    const safe = Math.max(0, Math.min(255, Math.round(parsed)));
    setAgreedNumber(safe);
    setNumberDraft(String(safe));
    setLabBits(emptyByte());
    setBitPhase("build");
    setHasFlippedBit(false);
    setSendRevealed(false);
    setConventionAnswer(null);
    unlockAndGo(2);
  }

  function toggleBit(index: number) {
    setLabBits((current) => current.map((bit, bitIndex) => (
      bitIndex === index ? (bit === "0" ? "1" : "0") : bit
    )));
  }

  function restartLesson() {
    setCurrentStep(0);
    setHighestUnlocked(0);
    setIntroGuess(null);
    setNumberDraft("65");
    setAgreedNumber(65);
    setConventionAnswer(null);
    setSendRevealed(false);
    setLabBits(emptyByte());
    setBitPhase("build");
    setHasFlippedBit(false);
    setFinalAnswer(null);
    clearPersistedLessonState(CHARACTER_REPRESENTATION_STORAGE_KEY);
    if (hasHydrated) writeStepToUrl(0, "replace");
  }

  if (!hasHydrated) {
    return <main className="app-shell" aria-busy="true" />;
  }

  let screen;

  switch (currentStep) {
    case 0:
      screen = (
        <MysteryStep
          introGuess={introGuess}
          onGuess={(guess) => {
            setIntroGuess(guess);
            unlock(1);
          }}
          onContinue={() => unlockAndGo(1)}
        />
      );
      break;
    case 1:
      screen = (
        <InventRuleStep
          numberDraft={numberDraft}
          onNumberDraftChange={setNumberDraft}
          onCommit={commitNumber}
        />
      );
      break;
    case 2:
      screen = (
        <QuestionRuleStep
          agreedNumber={agreedNumber}
          answer={conventionAnswer}
          onAnswer={(answer) => {
            setConventionAnswer(answer);
            if (answer === "no") unlock(3);
          }}
          onContinue={() => unlockAndGo(3)}
        />
      );
      break;
    case 3:
      screen = (
        <BreakAgreementStep
          agreedNumber={agreedNumber}
          sendRevealed={sendRevealed}
          onSend={() => {
            setSendRevealed(true);
            unlock(4);
          }}
          onContinue={() => unlockAndGo(4)}
        />
      );
      break;
    case 4:
      screen = (
        <BinaryStep
          agreedNumber={agreedNumber}
          labBits={labBits}
          bitPhase={bitPhase}
          hasFlippedBit={hasFlippedBit}
          onToggleBuildBit={toggleBit}
          onStartExplanation={() => {
            setLabBits(targetBits);
            setBitPhase("explain");
          }}
          onStartFreePlay={() => {
            setLabBits(targetBits);
            setBitPhase("play");
            setHasFlippedBit(false);
          }}
          onFlipBit={(index) => {
            toggleBit(index);
            setHasFlippedBit(true);
            unlock(5);
          }}
          onContinue={() => {
            setLabBits(targetBits);
            unlockAndGo(5);
          }}
        />
      );
      break;
    case 5:
      screen = (
        <FinalCheckStep
          answer={finalAnswer}
          onAnswer={(answer) => {
            setFinalAnswer(answer);
            if (answer === "representation") unlock(6);
          }}
          onContinue={() => unlockAndGo(6)}
        />
      );
      break;
    default:
      screen = <CompleteStep agreedNumber={agreedNumber} onRestart={restartLesson} />;
  }

  return (
    <LessonPlayer
      lessonNumber={1}
      title="How computers represent text"
      stepLabels={CHARACTER_REPRESENTATION_STEPS}
      currentStep={currentStep}
      highestUnlocked={highestUnlocked}
      darkStage={currentStep === 4}
      onNavigate={(step) => goTo(step)}
      onBack={() => goTo(Math.max(0, currentStep - 1))}
      onRestart={restartLesson}
    >
      {screen}
    </LessonPlayer>
  );
}
