"use client";

import { useMemo, useState } from "react";
import { LessonPlayer } from "../../components/lesson/LessonPlayer";
import { emptyByte, isBitArray, toBits } from "../../lib/lesson/binary";
import { useLessonProgress } from "../../lib/lesson/useLessonProgress";
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
} from "./types";

const STEP_COUNT = CHARACTER_REPRESENTATION_STEPS.length;
const DEFAULT_NUMBER = 65;

function safeAgreedNumber(value: unknown) {
  return Math.max(0, Math.min(255, Math.round(typeof value === "number" ? value : DEFAULT_NUMBER)));
}

export function CharacterRepresentationLesson() {
  const [introGuess, setIntroGuess] = useState<string | null>(null);
  const [numberDraft, setNumberDraft] = useState(String(DEFAULT_NUMBER));
  const [agreedNumber, setAgreedNumber] = useState(DEFAULT_NUMBER);
  const [conventionAnswer, setConventionAnswer] = useState<ConventionAnswer>(null);
  const [sendRevealed, setSendRevealed] = useState(false);
  const [labBits, setLabBits] = useState<string[]>(() => emptyByte());
  const [bitPhase, setBitPhase] = useState<BitPhase>("build");
  const [hasFlippedBit, setHasFlippedBit] = useState(false);
  const [proofBits, setProofBits] = useState<string[]>(() => emptyByte());
  const [receiverRule, setReceiverRule] = useState("");

  const targetBits = useMemo(() => toBits(agreedNumber), [agreedNumber]);

  const progress = useLessonProgress<CharacterRepresentationPersistedState>({
    storageKey: CHARACTER_REPRESENTATION_STORAGE_KEY,
    stepCount: STEP_COUNT,
    lessonState: {
      introGuess,
      numberDraft,
      agreedNumber,
      conventionAnswer,
      sendRevealed,
      labBits,
      bitPhase,
      hasFlippedBit,
      proofBits,
      receiverRule,
    },
    onRestore: (saved) => {
      const restoredNumber = safeAgreedNumber(saved?.agreedNumber);
      setIntroGuess(typeof saved?.introGuess === "string" ? saved.introGuess : null);
      setNumberDraft(typeof saved?.numberDraft === "string" ? saved.numberDraft : String(restoredNumber));
      setAgreedNumber(restoredNumber);
      setConventionAnswer(saved?.conventionAnswer === "yes" || saved?.conventionAnswer === "no" ? saved.conventionAnswer : null);
      setSendRevealed(saved?.sendRevealed === true);
      setLabBits(isBitArray(saved?.labBits) ? saved.labBits : emptyByte());
      setBitPhase(saved?.bitPhase === "explain" || saved?.bitPhase === "play" ? saved.bitPhase : "build");
      setHasFlippedBit(saved?.hasFlippedBit === true);
      setProofBits(isBitArray(saved?.proofBits) ? saved.proofBits : emptyByte());
      setReceiverRule(typeof saved?.receiverRule === "string" ? saved.receiverRule : "");
    },
    onReset: () => {
      setIntroGuess(null);
      setNumberDraft(String(DEFAULT_NUMBER));
      setAgreedNumber(DEFAULT_NUMBER);
      setConventionAnswer(null);
      setSendRevealed(false);
      setLabBits(emptyByte());
      setBitPhase("build");
      setHasFlippedBit(false);
      setProofBits(emptyByte());
      setReceiverRule("");
    },
  });

  function commitNumber() {
    const parsed = Number(numberDraft);
    if (!Number.isFinite(parsed)) return;

    const safe = safeAgreedNumber(parsed);
    setAgreedNumber(safe);
    setNumberDraft(String(safe));
    setLabBits(emptyByte());
    setBitPhase("build");
    setHasFlippedBit(false);
    setSendRevealed(false);
    setConventionAnswer(null);
    setProofBits(emptyByte());
    setReceiverRule("");
    progress.unlockAndGo(2);
  }

  function toggleBit(index: number) {
    setLabBits((current) => current.map((bit, bitIndex) => (
      bitIndex === index ? (bit === "0" ? "1" : "0") : bit
    )));
  }

  if (!progress.hasHydrated) {
    return <main className="app-shell" aria-busy="true" />;
  }

  let screen;

  switch (progress.currentStep) {
    case 0:
      screen = (
        <MysteryStep
          introGuess={introGuess}
          onGuess={(guess) => {
            setIntroGuess(guess);
            progress.unlock(1);
          }}
          onContinue={() => progress.unlockAndGo(1)}
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
            if (answer === "no") progress.unlock(3);
          }}
          onContinue={() => progress.unlockAndGo(3)}
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
            progress.unlock(4);
          }}
          onContinue={() => progress.unlockAndGo(4)}
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
            progress.unlock(5);
          }}
          onContinue={() => {
            setLabBits(targetBits);
            progress.unlockAndGo(5);
          }}
        />
      );
      break;
    case 5:
      screen = (
        <FinalCheckStep
          agreedNumber={agreedNumber}
          proofBits={proofBits}
          receiverRule={receiverRule}
          onToggleProofBit={(index) => setProofBits((current) => current.map((bit, bitIndex) => (
            bitIndex === index ? (bit === "0" ? "1" : "0") : bit
          )))}
          onReceiverRuleChange={setReceiverRule}
          onContinue={() => progress.unlockAndGo(6)}
        />
      );
      break;
    default:
      screen = <CompleteStep agreedNumber={agreedNumber} onRestart={progress.restart} />;
  }

  return (
    <LessonPlayer
      lessonNumber={1}
      lessonSlug="character-representation"
      title="How computers represent text"
      stepLabels={CHARACTER_REPRESENTATION_STEPS}
      currentStep={progress.currentStep}
      highestUnlocked={progress.highestUnlocked}
      darkStage={progress.currentStep === 4}
      onNavigate={(step) => progress.goTo(step)}
      onBack={progress.back}
      onRestart={progress.restart}
    >
      {screen}
    </LessonPlayer>
  );
}
