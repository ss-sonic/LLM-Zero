"use client";

import { useEffect, useState } from "react";
import { LessonPlayer } from "../../components/lesson/LessonPlayer";
import type { RecallAssessment } from "../../components/ui/TextRecall";
import { emptyByte, isBitArray, bitsToNumber } from "../../lib/lesson/binary";
import { readStepFromUrl, writeStepToUrl } from "../../lib/lesson/navigation";
import {
  clearPersistedLessonState,
  readPersistedLessonState,
  writePersistedLessonState,
} from "../../lib/lesson/persistence";
import { clampStep } from "../../lib/lesson/progress";
import {
  CODE_POINTS_VS_BYTES_STEPS,
  CODE_POINTS_VS_BYTES_STORAGE_KEY,
  COST_TEXT,
  LATIN_A,
  ROCKET,
  TOY_WIDTH,
  WIDTH_OPTIONS,
} from "./config";
import { BYTE_MAX, BYTE_PATTERNS, encodeFixed, encodeText } from "./encoding";
import { BreakDecodingStep } from "./steps/BreakDecoding";
import { ByteRangeStep } from "./steps/ByteRange";
import { CompleteStep } from "./steps/Complete";
import { CountCostStep } from "./steps/CountCost";
import { EncodeDecodeStep } from "./steps/EncodeDecode";
import { ForcedSequenceStep } from "./steps/ForcedSequence";
import { NameEncodingStep } from "./steps/NameEncoding";
import { ResumePipelineStep } from "./steps/ResumePipeline";
import { SpendMoreBytesStep } from "./steps/SpendMoreBytes";
import type { CodePointsVsBytesPersistedState, ForcedAnswer } from "./types";

const STEP_COUNT = CODE_POINTS_VS_BYTES_STEPS.length;
const A_BYTES = encodeFixed(LATIN_A.codePoint, TOY_WIDTH) ?? [];
const COST_STREAM = encodeText(COST_TEXT, TOY_WIDTH);
const COST_TOTAL = COST_STREAM.length;
const COST_ZEROS = COST_STREAM.filter((byte) => byte === 0).length;

function emptyInputs(length: number) {
  return Array.from({ length }, () => "");
}

function safeInputs(value: unknown, length: number) {
  if (!Array.isArray(value) || value.length !== length) return emptyInputs(length);
  return value.map((item) => typeof item === "string" ? item : "");
}

function safeAssessment(value: unknown): RecallAssessment {
  return value === "matched" || value === "missed" ? value : null;
}

function safeWidths(value: unknown) {
  if (!Array.isArray(value)) return [];
  const allowed: readonly number[] = WIDTH_OPTIONS;
  return Array.from(new Set(value.filter((item): item is number => typeof item === "number" && allowed.includes(item))));
}

export function CodePointsVsBytesLesson() {
  const [hasHydrated, setHasHydrated] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [highestUnlocked, setHighestUnlocked] = useState(0);

  const [unicodeRecallText, setUnicodeRecallText] = useState("");
  const [unicodeRecallCommitted, setUnicodeRecallCommitted] = useState(false);
  const [unicodeRecallAssessment, setUnicodeRecallAssessment] = useState<RecallAssessment>(null);

  const [byteBits, setByteBits] = useState<string[]>(emptyByte());
  const [patternCountInput, setPatternCountInput] = useState("");

  const [buildBytes, setBuildBytes] = useState<string[]>(emptyInputs(TOY_WIDTH));

  const [widthsSeen, setWidthsSeen] = useState<number[]>([]);
  const [forcedAnswer, setForcedAnswer] = useState<ForcedAnswer>(null);

  const [streamSent, setStreamSent] = useState(false);
  const [decodeRecallText, setDecodeRecallText] = useState("");
  const [decodeRecallCommitted, setDecodeRecallCommitted] = useState(false);
  const [decodeRecallAssessment, setDecodeRecallAssessment] = useState<RecallAssessment>(null);

  const [encodingRevealed, setEncodingRevealed] = useState(false);

  const [encodeInputs, setEncodeInputs] = useState<string[]>(emptyInputs(TOY_WIDTH));
  const [decodeInput, setDecodeInput] = useState("");

  const [costTotalInput, setCostTotalInput] = useState("");
  const [costZeroInput, setCostZeroInput] = useState("");

  useEffect(() => {
    const saved = readPersistedLessonState<CodePointsVsBytesPersistedState>(CODE_POINTS_VS_BYTES_STORAGE_KEY);
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
    setUnicodeRecallText(typeof saved?.unicodeRecallText === "string" ? saved.unicodeRecallText : "");
    setUnicodeRecallCommitted(saved?.unicodeRecallCommitted === true);
    setUnicodeRecallAssessment(safeAssessment(saved?.unicodeRecallAssessment));
    setByteBits(isBitArray(saved?.byteBits) ? saved.byteBits : emptyByte());
    setPatternCountInput(typeof saved?.patternCountInput === "string" ? saved.patternCountInput : "");
    setBuildBytes(safeInputs(saved?.buildBytes, TOY_WIDTH));
    setWidthsSeen(safeWidths(saved?.widthsSeen));
    setForcedAnswer(saved?.forcedAnswer === "one-correct" || saved?.forcedAnswer === "rule-relative" ? saved.forcedAnswer : null);
    setStreamSent(saved?.streamSent === true);
    setDecodeRecallText(typeof saved?.decodeRecallText === "string" ? saved.decodeRecallText : "");
    setDecodeRecallCommitted(saved?.decodeRecallCommitted === true);
    setDecodeRecallAssessment(safeAssessment(saved?.decodeRecallAssessment));
    setEncodingRevealed(saved?.encodingRevealed === true);
    setEncodeInputs(safeInputs(saved?.encodeInputs, TOY_WIDTH));
    setDecodeInput(typeof saved?.decodeInput === "string" ? saved.decodeInput : "");
    setCostTotalInput(typeof saved?.costTotalInput === "string" ? saved.costTotalInput : "");
    setCostZeroInput(typeof saved?.costZeroInput === "string" ? saved.costZeroInput : "");
    writeStepToUrl(restoredCurrent, "replace");
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;
    const state: CodePointsVsBytesPersistedState = {
      currentStep,
      highestUnlocked,
      unicodeRecallText,
      unicodeRecallCommitted,
      unicodeRecallAssessment,
      byteBits,
      patternCountInput,
      buildBytes,
      widthsSeen,
      forcedAnswer,
      streamSent,
      decodeRecallText,
      decodeRecallCommitted,
      decodeRecallAssessment,
      encodingRevealed,
      encodeInputs,
      decodeInput,
      costTotalInput,
      costZeroInput,
    };
    writePersistedLessonState(CODE_POINTS_VS_BYTES_STORAGE_KEY, state);
  }, [
    hasHydrated, currentStep, highestUnlocked,
    unicodeRecallText, unicodeRecallCommitted, unicodeRecallAssessment,
    byteBits, patternCountInput, buildBytes, widthsSeen, forcedAnswer,
    streamSent, decodeRecallText, decodeRecallCommitted, decodeRecallAssessment,
    encodingRevealed, encodeInputs, decodeInput, costTotalInput, costZeroInput,
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

  function toggleBit(index: number) {
    setByteBits((current) => {
      const next = current.map((bit, bitIndex) => bitIndex === index ? (bit === "1" ? "0" : "1") : bit);
      // The pattern count only makes sense once the maximum has been rebuilt.
      if (bitsToNumber(next) !== BYTE_MAX) setPatternCountInput("");
      return next;
    });
  }

  function updatePatternCount(value: string) {
    setPatternCountInput(value);
    if (Number(value) === BYTE_PATTERNS && bitsToNumber(byteBits) === BYTE_MAX) unlock(2);
  }

  function updateBuildByte(index: number, value: string) {
    setBuildBytes((current) => {
      const next = current.map((item, itemIndex) => itemIndex === index ? value : item);
      const total = next.reduce((sum, item, itemIndex) => {
        const numeric = Number(item);
        if (item.trim() === "" || !Number.isFinite(numeric)) return Number.NaN;
        return sum + numeric * BYTE_PATTERNS ** (TOY_WIDTH - 1 - itemIndex);
      }, 0);
      if (total === ROCKET.codePoint && next.every((item) => Number(item) >= 0 && Number(item) <= BYTE_MAX)) unlock(3);
      return next;
    });
  }

  function inspectWidth(width: number) {
    setWidthsSeen((current) => current.includes(width) ? current : [...current, width]);
  }

  function updateEncodeInput(index: number, value: string) {
    setEncodeInputs((current) => {
      const next = current.map((item, itemIndex) => itemIndex === index ? value : item);
      if (A_BYTES.every((byte, byteIndex) => next[byteIndex].trim() !== "" && Number(next[byteIndex]) === byte)
        && Number(decodeInput) === ROCKET.codePoint) unlock(7);
      return next;
    });
  }

  function updateDecodeInput(value: string) {
    setDecodeInput(value);
    if (Number(value) === ROCKET.codePoint
      && A_BYTES.every((byte, byteIndex) => encodeInputs[byteIndex].trim() !== "" && Number(encodeInputs[byteIndex]) === byte)) unlock(7);
  }

  function updateCostTotal(value: string) {
    setCostTotalInput(value);
    if (Number(value) === COST_TOTAL && Number(costZeroInput) === COST_ZEROS) unlock(8);
  }

  function updateCostZero(value: string) {
    setCostZeroInput(value);
    if (Number(value) === COST_ZEROS && Number(costTotalInput) === COST_TOTAL) unlock(8);
  }

  function restartLesson() {
    setCurrentStep(0);
    setHighestUnlocked(0);
    setUnicodeRecallText("");
    setUnicodeRecallCommitted(false);
    setUnicodeRecallAssessment(null);
    setByteBits(emptyByte());
    setPatternCountInput("");
    setBuildBytes(emptyInputs(TOY_WIDTH));
    setWidthsSeen([]);
    setForcedAnswer(null);
    setStreamSent(false);
    setDecodeRecallText("");
    setDecodeRecallCommitted(false);
    setDecodeRecallAssessment(null);
    setEncodingRevealed(false);
    setEncodeInputs(emptyInputs(TOY_WIDTH));
    setDecodeInput("");
    setCostTotalInput("");
    setCostZeroInput("");
    clearPersistedLessonState(CODE_POINTS_VS_BYTES_STORAGE_KEY);
    if (hasHydrated) writeStepToUrl(0, "replace");
  }

  if (!hasHydrated) return <main className="app-shell" aria-busy="true" />;

  let screen;
  switch (currentStep) {
    case 0:
      screen = (
        <ResumePipelineStep
          recallText={unicodeRecallText}
          recallCommitted={unicodeRecallCommitted}
          recallAssessment={unicodeRecallAssessment}
          onRecallChange={setUnicodeRecallText}
          onRecallCommit={() => setUnicodeRecallCommitted(true)}
          onRecallAssess={(assessment) => { setUnicodeRecallAssessment(assessment); unlock(1); }}
          onRecallRewrite={() => { setUnicodeRecallCommitted(false); setUnicodeRecallAssessment(null); }}
          onContinue={() => unlockAndGo(1)}
        />
      );
      break;
    case 1:
      screen = (
        <ByteRangeStep
          bits={byteBits}
          patternCountInput={patternCountInput}
          onToggleBit={toggleBit}
          onPatternCountChange={updatePatternCount}
          onContinue={() => unlockAndGo(2)}
        />
      );
      break;
    case 2:
      screen = (
        <SpendMoreBytesStep
          values={buildBytes}
          onChange={updateBuildByte}
          onContinue={() => unlockAndGo(3)}
        />
      );
      break;
    case 3:
      screen = (
        <ForcedSequenceStep
          widthsSeen={widthsSeen}
          answer={forcedAnswer}
          onInspect={inspectWidth}
          onAnswer={(answer) => { setForcedAnswer(answer); if (answer === "rule-relative") unlock(4); }}
          onContinue={() => unlockAndGo(4)}
        />
      );
      break;
    case 4:
      screen = (
        <BreakDecodingStep
          sent={streamSent}
          recallText={decodeRecallText}
          recallCommitted={decodeRecallCommitted}
          recallAssessment={decodeRecallAssessment}
          onSend={() => setStreamSent(true)}
          onRecallChange={setDecodeRecallText}
          onRecallCommit={() => setDecodeRecallCommitted(true)}
          onRecallAssess={(assessment) => { setDecodeRecallAssessment(assessment); unlock(5); }}
          onRecallRewrite={() => { setDecodeRecallCommitted(false); setDecodeRecallAssessment(null); }}
          onContinue={() => unlockAndGo(5)}
        />
      );
      break;
    case 5:
      screen = (
        <NameEncodingStep
          revealed={encodingRevealed}
          onReveal={() => { setEncodingRevealed(true); unlock(6); }}
          onContinue={() => unlockAndGo(6)}
        />
      );
      break;
    case 6:
      screen = (
        <EncodeDecodeStep
          encodeInputs={encodeInputs}
          decodeInput={decodeInput}
          onEncodeChange={updateEncodeInput}
          onDecodeChange={updateDecodeInput}
          onFinish={() => unlockAndGo(7)}
        />
      );
      break;
    case 7:
      screen = (
        <CountCostStep
          totalInput={costTotalInput}
          zeroInput={costZeroInput}
          onTotalChange={updateCostTotal}
          onZeroChange={updateCostZero}
          onFinish={() => unlockAndGo(8)}
        />
      );
      break;
    default:
      screen = <CompleteStep onRestart={restartLesson} />;
  }

  return (
    <LessonPlayer
      lessonNumber={6}
      title="A code point is not a byte"
      stepLabels={CODE_POINTS_VS_BYTES_STEPS}
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
