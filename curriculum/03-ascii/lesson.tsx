"use client";

import { useState } from "react";
import { LessonPlayer } from "../../components/lesson/LessonPlayer";
import type { RecallAssessment } from "../../components/ui/TextRecall";
import { useLessonProgress } from "../../lib/lesson/useLessonProgress";
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
const EMPTY_CAT = ["", "", ""];

function isTinyStandard(value: unknown): value is TinyStandard {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<TinyStandard>;
  return (["A", "B", "C"] as const).every((symbol) => (
    typeof candidate[symbol] === "number" && Number.isFinite(candidate[symbol])
  ));
}

function safeExplorerValues(value: unknown) {
  if (!Array.isArray(value)) return [65];
  const values = value.filter((item): item is number => (
    typeof item === "number" && Number.isInteger(item) && item >= 32 && item <= 126
  ));
  return values.length ? Array.from(new Set(values)) : [65];
}

/**
 * Learners who were mid-lesson when the CAT check was a set of choice buttons
 * keep the values they had already picked.
 */
function restoreCatInputs(saved: Partial<AsciiPersistedState> | null) {
  if (Array.isArray(saved?.catInputs) && saved.catInputs.length === 3) {
    return saved.catInputs.map((item) => typeof item === "string" ? item : "");
  }
  if (Array.isArray(saved?.catValues) && saved.catValues.length === 3) {
    return saved.catValues.map((item) => typeof item === "number" ? String(item) : "");
  }
  return [...EMPTY_CAT];
}

export function AsciiLesson() {
  const [scaleChoice, setScaleChoice] = useState<ScaleChoice>(null);
  const [tinyStandard, setTinyStandard] = useState<TinyStandard>({ ...DEFAULT_TINY_STANDARD });
  const [tinyPublished, setTinyPublished] = useState(false);
  const [tinySent, setTinySent] = useState(false);
  const [asciiRevealed, setAsciiRevealed] = useState(false);
  const [why65Answer, setWhy65Answer] = useState<Why65Answer>(null);
  const [explorerValue, setExplorerValue] = useState(65);
  const [exploredValues, setExploredValues] = useState<number[]>([65]);
  const [catInputs, setCatInputs] = useState<string[]>([...EMPTY_CAT]);
  const [catSent, setCatSent] = useState(false);
  const [boundarySampleId, setBoundarySampleId] = useState<string | null>(null);
  const [boundaryRecall, setBoundaryRecall] = useState("");
  const [boundaryCommitted, setBoundaryCommitted] = useState(false);
  const [boundaryAssessment, setBoundaryAssessment] = useState<RecallAssessment>(null);

  const progress = useLessonProgress<AsciiPersistedState>({
    storageKey: ASCII_STORAGE_KEY,
    stepCount: STEP_COUNT,
    lessonState: {
      scaleChoice,
      tinyStandard,
      tinyPublished,
      tinySent,
      asciiRevealed,
      why65Answer,
      explorerValue,
      exploredValues,
      catInputs,
      catSent,
      boundarySampleId,
      boundaryRecall,
      boundaryCommitted,
      boundaryAssessment,
    },
    onRestore: (saved) => {
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
      setExplorerValue(Math.max(32, Math.min(126, Math.round(typeof saved?.explorerValue === "number" ? saved.explorerValue : 65))));
      setExploredValues(safeExplorerValues(saved?.exploredValues));
      setCatInputs(restoreCatInputs(saved));
      setCatSent(saved?.catSent === true);
      setBoundarySampleId(typeof saved?.boundarySampleId === "string" ? saved.boundarySampleId : null);
      setBoundaryRecall(typeof saved?.boundaryRecall === "string" ? saved.boundaryRecall : "");
      setBoundaryCommitted(saved?.boundaryCommitted === true);
      setBoundaryAssessment(saved?.boundaryAssessment === "matched" || saved?.boundaryAssessment === "missed" ? saved.boundaryAssessment : null);
    },
    onReset: () => {
      setScaleChoice(null);
      setTinyStandard({ ...DEFAULT_TINY_STANDARD });
      setTinyPublished(false);
      setTinySent(false);
      setAsciiRevealed(false);
      setWhy65Answer(null);
      setExplorerValue(65);
      setExploredValues([65]);
      setCatInputs([...EMPTY_CAT]);
      setCatSent(false);
      setBoundarySampleId(null);
      setBoundaryRecall("");
      setBoundaryCommitted(false);
      setBoundaryAssessment(null);
    },
  });

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

  if (!progress.hasHydrated) return <main className="app-shell" aria-busy="true" />;

  let screen;
  switch (progress.currentStep) {
    case 0:
      screen = (
        <ScaleProblemStep
          choice={scaleChoice}
          onChoice={(choice) => {
            setScaleChoice(choice);
            if (choice === "published") progress.unlock(1);
          }}
          onContinue={() => progress.unlockAndGo(1)}
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
          onContinue={() => progress.unlockAndGo(2)}
        />
      );
      break;
    case 2:
      screen = (
        <MeetAsciiStep
          revealed={asciiRevealed}
          onReveal={() => setAsciiRevealed(true)}
          onContinue={() => progress.unlockAndGo(3)}
        />
      );
      break;
    case 3:
      screen = (
        <Why65Step
          answer={why65Answer}
          onAnswer={(answer) => {
            setWhy65Answer(answer);
            if (answer === "standard") progress.unlock(4);
          }}
          onContinue={() => progress.unlockAndGo(4)}
        />
      );
      break;
    case 4:
      screen = (
        <ExploreAsciiStep
          value={explorerValue}
          exploredValues={exploredValues}
          onSelect={selectExplorerValue}
          onContinue={() => progress.unlockAndGo(5)}
        />
      );
      break;
    case 5:
      screen = (
        <EncodeCatStep
          values={catInputs}
          sent={catSent}
          onChange={(index, value) => setCatInputs((current) => current.map((item, itemIndex) => itemIndex === index ? value : item))}
          onSend={() => setCatSent(true)}
          onContinue={() => progress.unlockAndGo(6)}
        />
      );
      break;
    case 6:
      screen = (
        <BoundaryStep
          sampleId={boundarySampleId}
          recallText={boundaryRecall}
          recallCommitted={boundaryCommitted}
          recallAssessment={boundaryAssessment}
          onTry={(sampleId) => setBoundarySampleId(sampleId)}
          onRecallChange={setBoundaryRecall}
          onRecallCommit={() => setBoundaryCommitted(true)}
          onRecallAssess={(assessment) => { setBoundaryAssessment(assessment); progress.unlock(7); }}
          onRecallRewrite={() => { setBoundaryCommitted(false); setBoundaryAssessment(null); }}
          onContinue={() => progress.unlockAndGo(7)}
        />
      );
      break;
    default:
      screen = <CompleteStep onRestart={progress.restart} />;
  }

  return (
    <LessonPlayer
      lessonNumber={3}
      lessonSlug="ascii"
      title="ASCII: one shared character standard"
      stepLabels={ASCII_STEPS}
      currentStep={progress.currentStep}
      highestUnlocked={progress.highestUnlocked}
      onNavigate={(step) => progress.goTo(step)}
      onBack={progress.back}
      onRestart={progress.restart}
    >
      {screen}
    </LessonPlayer>
  );
}
