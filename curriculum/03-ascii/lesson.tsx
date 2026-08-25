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
import {
  ASCII_STEPS,
  ASCII_STORAGE_KEY,
  DEFAULT_TINY_STANDARD,
} from "./config";
import { BoundaryStep } from "./steps/Boundary";
import { CompleteStep } from "./steps/Complete";
import { EncodeCatStep } from "./steps/EncodeCat";
import { ExploreAsciiStep } from "./steps/ExploreAscii";
import { MeetAsciiStep } from "./steps/MeetAscii";
import { PublishStandardStep } from "./steps/PublishStandard";
import { ScaleProblemStep } from "./steps/ScaleProblem";
import { Why65Step } from "./steps/Why65";
import type {
  AsciiPersistedState,
  ScaleChoice,
  TinyStandard,
  Why65Answer,
} from "./types";

const STEP_COUNT = ASCII_STEPS.length;

function isTinyStandard(value: unknown): value is TinyStandard {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<TinyStandard>;
  return (["A", "B", "C"] as const).every((symbol) => (
    typeof candidate[symbol] === "number" && Number.isFinite(candidate[symbol])
  ));
}

function isCatValues(value: unknown): value is Array<number | null> {
  return Array.isArray(value)
    && value.length === 3
    && value.every((item) => item === null || typeof item === "number");
}

function safeExplorerValues(value: unknown) {
  if (!Array.isArray(value)) return [65];
  const values = value.filter((item): item is number => (
    typeof item === "number" && Number.isInteger(item) && item >= 32 && item <= 126
  ));
  return values.length ? Array.from(new Set(values)) : [65];
}

export function AsciiLesson() {
  const [hasHydrated, setHasHydrated] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [highestUnlocked, setHighestUnlocked] = useState(0);
  const [scaleChoice, setScaleChoice] = useState<ScaleChoice>(null);
  const [tinyStandard, setTinyStandard] = useState<TinyStandard>({ ...DEFAULT_TINY_STANDARD });
  const [tinyPublished, setTinyPublished] = useState(false);
  const [tinySent, setTinySent] = useState(false);
  const [asciiRevealed, setAsciiRevealed] = useState(false);
  const [why65Answer, setWhy65Answer] = useState<Why65Answer>(null);
  const [explorerValue, setExplorerValue] = useState(65);
  const [exploredValues, setExploredValues] = useState<number[]>([65]);
  const [catValues, setCatValues] = useState<Array<number | null>>([null, null, null]);
  const [catSent, setCatSent] = useState(false);
  const [boundarySampleId, setBoundarySampleId] = useState<string | null>(null);

  useEffect(() => {
    const saved = readPersistedLessonState<AsciiPersistedState>(ASCII_STORAGE_KEY);
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
    const restoredExplorer = Math.max(
      32,
      Math.min(126, Math.round(typeof saved?.explorerValue === "number" ? saved.explorerValue : 65)),
    );

    setCurrentStep(restoredCurrent);
    setHighestUnlocked(restoredHighest);
    setScaleChoice(
      saved?.scaleChoice === "pairwise" || saved?.scaleChoice === "published" || saved?.scaleChoice === "guess"
        ? saved.scaleChoice
        : null,
    );
    setTinyStandard(isTinyStandard(saved?.tinyStandard) ? saved.tinyStandard : { ...DEFAULT_TINY_STANDARD });
    setTinyPublished(saved?.tinyPublished === true);
    setTinySent(saved?.tinySent === true);
    setAsciiRevealed(saved?.asciiRevealed === true);
    setWhy65Answer(
      saved?.why65Answer === "shape" || saved?.why65Answer === "standard" || saved?.why65Answer === "binary"
        ? saved.why65Answer
        : null,
    );
    setExplorerValue(restoredExplorer);
    setExploredValues(safeExplorerValues(saved?.exploredValues));
    setCatValues(isCatValues(saved?.catValues) ? saved.catValues : [null, null, null]);
    setCatSent(saved?.catSent === true);
    setBoundarySampleId(typeof saved?.boundarySampleId === "string" ? saved.boundarySampleId : null);
    writeStepToUrl(restoredCurrent, "replace");
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;

    const state: AsciiPersistedState = {
      currentStep,
      highestUnlocked,
      scaleChoice,
      tinyStandard,
      tinyPublished,
      tinySent,
      asciiRevealed,
      why65Answer,
      explorerValue,
      exploredValues,
      catValues,
      catSent,
      boundarySampleId,
    };

    writePersistedLessonState(ASCII_STORAGE_KEY, state);
  }, [
    hasHydrated,
    currentStep,
    highestUnlocked,
    scaleChoice,
    tinyStandard,
    tinyPublished,
    tinySent,
    asciiRevealed,
    why65Answer,
    explorerValue,
    exploredValues,
    catValues,
    catSent,
    boundarySampleId,
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

  function updateTinyStandard(symbol: keyof TinyStandard, value: number) {
    setTinyStandard((current) => ({ ...current, [symbol]: value }));
    setTinyPublished(false);
    setTinySent(false);
  }

  function selectExplorerValue(value: number) {
    const safe = Math.max(32, Math.min(126, Math.round(value)));
    setExplorerValue(safe);
    setExploredValues((current) => current.includes(safe) ? current : [...current, safe]);
  }

  function restartLesson() {
    setCurrentStep(0);
    setHighestUnlocked(0);
    setScaleChoice(null);
    setTinyStandard({ ...DEFAULT_TINY_STANDARD });
    setTinyPublished(false);
    setTinySent(false);
    setAsciiRevealed(false);
    setWhy65Answer(null);
    setExplorerValue(65);
    setExploredValues([65]);
    setCatValues([null, null, null]);
    setCatSent(false);
    setBoundarySampleId(null);
    clearPersistedLessonState(ASCII_STORAGE_KEY);
    if (hasHydrated) writeStepToUrl(0, "replace");
  }

  if (!hasHydrated) return <main className="app-shell" aria-busy="true" />;

  let screen;
  switch (currentStep) {
    case 0:
      screen = (
        <ScaleProblemStep
          choice={scaleChoice}
          onChoice={(choice) => {
            setScaleChoice(choice);
            if (choice === "published") unlock(1);
          }}
          onContinue={() => unlockAndGo(1)}
        />
      );
      break;
    case 1:
      screen = (
        <PublishStandardStep
          table={tinyStandard}
          published={tinyPublished}
          sent={tinySent}
          onChange={updateTinyStandard}
          onPublish={() => { setTinyPublished(true); setTinySent(false); }}
          onSend={() => setTinySent(true)}
          onContinue={() => unlockAndGo(2)}
        />
      );
      break;
    case 2:
      screen = (
        <MeetAsciiStep
          revealed={asciiRevealed}
          onReveal={() => setAsciiRevealed(true)}
          onContinue={() => unlockAndGo(3)}
        />
      );
      break;
    case 3:
      screen = (
        <Why65Step
          answer={why65Answer}
          onAnswer={(answer) => {
            setWhy65Answer(answer);
            if (answer === "standard") unlock(4);
          }}
          onContinue={() => unlockAndGo(4)}
        />
      );
      break;
    case 4:
      screen = (
        <ExploreAsciiStep
          value={explorerValue}
          exploredValues={exploredValues}
          onSelect={selectExplorerValue}
          onContinue={() => unlockAndGo(5)}
        />
      );
      break;
    case 5:
      screen = (
        <EncodeCatStep
          values={catValues}
          sent={catSent}
          onChoose={(index, value) => setCatValues((current) => current.map((item, itemIndex) => itemIndex === index ? value : item))}
          onSend={() => setCatSent(true)}
          onContinue={() => unlockAndGo(6)}
        />
      );
      break;
    case 6:
      screen = (
        <BoundaryStep
          sampleId={boundarySampleId}
          onTry={(sampleId) => setBoundarySampleId(sampleId)}
          onContinue={() => unlockAndGo(7)}
        />
      );
      break;
    default:
      screen = <CompleteStep onRestart={restartLesson} />;
  }

  return (
    <LessonPlayer
      lessonNumber={3}
      title="ASCII: one shared character standard"
      stepLabels={ASCII_STEPS}
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
