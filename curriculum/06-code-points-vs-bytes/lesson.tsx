"use client";

import { useEffect, useState } from "react";
import { LessonPlayer } from "../../components/lesson/LessonPlayer";
import type { RecallAssessment } from "../../components/ui/TextRecall";
import { bitsToNumber, emptyByte, isBitArray } from "../../lib/lesson/binary";
import { readStepFromUrl, writeStepToUrl } from "../../lib/lesson/navigation";
import {
  clearPersistedLessonState,
  readPersistedLessonState,
  writePersistedLessonState,
} from "../../lib/lesson/persistence";
import { clampStep } from "../../lib/lesson/progress";
import {
  ALTERNATE_WIDTH,
  CODE_POINTS_VS_BYTES_STEPS,
  CODE_POINTS_VS_BYTES_STORAGE_KEY,
  COST_TEXT,
  ROCKET,
  TOY_WIDTH,
} from "./config";
import { decodeFixedWidth, encodeFixedWidth, isByteValue } from "./encoding";
import { BreakAgreementStep } from "./steps/BreakAgreement";
import { ByteLimitStep } from "./steps/ByteLimit";
import { ChangeRuleStep } from "./steps/ChangeRule";
import { CompleteStep } from "./steps/Complete";
import { CountWasteStep } from "./steps/CountWaste";
import { InventStorageStep } from "./steps/InventStorage";
import { NameEncodingStep } from "./steps/NameEncoding";
import { ResumeProblemStep } from "./steps/ResumeProblem";
import { RoundTripStep } from "./steps/RoundTrip";
import type { CodePointsVsBytesPersistedState, RuleConclusion } from "./types";

const STEP_COUNT = CODE_POINTS_VS_BYTES_STEPS.length;
const ROCKET_BYTES = encodeFixedWidth(ROCKET.decimal, TOY_WIDTH) ?? [];
const COST_BYTES = Array.from(COST_TEXT).flatMap((character) => encodeFixedWidth(character.codePointAt(0) ?? 0, TOY_WIDTH) ?? []);
const COST_TOTAL = COST_BYTES.length;
const COST_ZEROS = COST_BYTES.filter((byte) => byte === 0).length;

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
  return Array.from(new Set(value.filter((item): item is number => item === TOY_WIDTH || item === ALTERNATE_WIDTH)));
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
  const [storageInputs, setStorageInputs] = useState<string[]>(emptyInputs(TOY_WIDTH));
  const [inspectedWidths, setInspectedWidths] = useState<number[]>([]);
  const [ruleConclusion, setRuleConclusion] = useState<RuleConclusion>(null);
  const [mismatchSent, setMismatchSent] = useState(false);
  const [agreementRecallText, setAgreementRecallText] = useState("");
  const [agreementRecallCommitted, setAgreementRecallCommitted] = useState(false);
  const [agreementRecallAssessment, setAgreementRecallAssessment] = useState<RecallAssessment>(null);
  const [encodingRevealed, setEncodingRevealed] = useState(false);
  const [roundTripEncodeInputs, setRoundTripEncodeInputs] = useState<string[]>(emptyInputs(TOY_WIDTH));
  const [decodeRocketInput, setDecodeRocketInput] = useState("");
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
    setStorageInputs(safeInputs(saved?.storageInputs, TOY_WIDTH));
    setInspectedWidths(safeWidths(saved?.inspectedWidths));
    setRuleConclusion(saved?.ruleConclusion === "code-point" || saved?.ruleConclusion === "rule" ? saved.ruleConclusion : null);
    setMismatchSent(saved?.mismatchSent === true);
    setAgreementRecallText(typeof saved?.agreementRecallText === "string" ? saved.agreementRecallText : "");
    setAgreementRecallCommitted(saved?.agreementRecallCommitted === true);
    setAgreementRecallAssessment(safeAssessment(saved?.agreementRecallAssessment));
    setEncodingRevealed(saved?.encodingRevealed === true);
    setRoundTripEncodeInputs(safeInputs(saved?.roundTripEncodeInputs, TOY_WIDTH));
    setDecodeRocketInput(typeof saved?.decodeRocketInput === "string" ? saved.decodeRocketInput : "");
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
      storageInputs,
      inspectedWidths,
      ruleConclusion,
      mismatchSent,
      agreementRecallText,
      agreementRecallCommitted,
      agreementRecallAssessment,
      encodingRevealed,
      roundTripEncodeInputs,
      decodeRocketInput,
      costTotalInput,
      costZeroInput,
    };
    writePersistedLessonState(CODE_POINTS_VS_BYTES_STORAGE_KEY, state);
  }, [
    hasHydrated, currentStep, highestUnlocked, unicodeRecallText, unicodeRecallCommitted,
    unicodeRecallAssessment, byteBits, patternCountInput, storageInputs, inspectedWidths,
    ruleConclusion, mismatchSent, agreementRecallText, agreementRecallCommitted,
    agreementRecallAssessment, encodingRevealed, roundTripEncodeInputs, decodeRocketInput,
    costTotalInput, costZeroInput,
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
    setByteBits((current) => current.map((bit, bitIndex) => bitIndex === index ? (bit === "1" ? "0" : "1") : bit));
  }

  function updatePatternCount(value: string) {
    setPatternCountInput(value);
    if (bitsToNumber(byteBits) === 255 && Number(value) === 256) unlock(2);
  }

  function updateStorageInput(index: number, value: string) {
    setStorageInputs((current) => {
      const next = current.map((item, itemIndex) => itemIndex === index ? value : item);
      const numbers = next.map(Number);
      if (next.every((item) => item.trim() !== "") && numbers.every(isByteValue) && decodeFixedWidth(numbers) === ROCKET.decimal) unlock(3);
      return next;
    });
  }

  function inspectWidth(width: number) {
    setInspectedWidths((current) => current.includes(width) ? current : [...current, width]);
  }

  function updateRoundTripEncode(index: number, value: string) {
    setRoundTripEncodeInputs((current) => {
      const next = current.map((item, itemIndex) => itemIndex === index ? value : item);
      const encodeCorrect = ROCKET_BYTES.every((byte, byteIndex) => next[byteIndex].trim() !== "" && Number(next[byteIndex]) === byte);
      if (encodeCorrect && Number(decodeRocketInput) === ROCKET.decimal) unlock(7);
      return next;
    });
  }

  function updateDecodeRocket(value: string) {
    setDecodeRocketInput(value);
    const encodeCorrect = ROCKET_BYTES.every((byte, index) => roundTripEncodeInputs[index].trim() !== "" && Number(roundTripEncodeInputs[index]) === byte);
    if (encodeCorrect && Number(value) === ROCKET.decimal) unlock(7);
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
    setStorageInputs(emptyInputs(TOY_WIDTH));
    setInspectedWidths([]);
    setRuleConclusion(null);
    setMismatchSent(false);
    setAgreementRecallText("");
    setAgreementRecallCommitted(false);
    setAgreementRecallAssessment(null);
    setEncodingRevealed(false);
    setRoundTripEncodeInputs(emptyInputs(TOY_WIDTH));
    setDecodeRocketInput("");
    setCostTotalInput("");
    setCostZeroInput("");
    clearPersistedLessonState(CODE_POINTS_VS_BYTES_STORAGE_KEY);
    if (hasHydrated) writeStepToUrl(0, "replace");
  }

  if (!hasHydrated) return <main className="app-shell" aria-busy="true" />;

  let screen;
  switch (currentStep) {
    case 0:
      screen = <ResumeProblemStep
        recallText={unicodeRecallText}
        committed={unicodeRecallCommitted}
        assessment={unicodeRecallAssessment}
        onChange={setUnicodeRecallText}
        onCommit={() => setUnicodeRecallCommitted(true)}
        onAssess={(assessment) => { setUnicodeRecallAssessment(assessment); unlock(1); }}
        onRewrite={() => { setUnicodeRecallCommitted(false); setUnicodeRecallAssessment(null); }}
        onContinue={() => unlockAndGo(1)}
      />;
      break;
    case 1:
      screen = <ByteLimitStep
        bits={byteBits}
        patternCountInput={patternCountInput}
        onToggleBit={toggleBit}
        onPatternCountChange={updatePatternCount}
        onContinue={() => unlockAndGo(2)}
      />;
      break;
    case 2:
      screen = <InventStorageStep values={storageInputs} onChange={updateStorageInput} onContinue={() => unlockAndGo(3)} />;
      break;
    case 3:
      screen = <ChangeRuleStep
        inspectedWidths={inspectedWidths}
        conclusion={ruleConclusion}
        onInspect={inspectWidth}
        onConclusion={(answer) => { setRuleConclusion(answer); if (answer === "rule") unlock(4); }}
        onContinue={() => unlockAndGo(4)}
      />;
      break;
    case 4:
      screen = <BreakAgreementStep
        sent={mismatchSent}
        recallText={agreementRecallText}
        committed={agreementRecallCommitted}
        assessment={agreementRecallAssessment}
        onSend={() => setMismatchSent(true)}
        onChange={setAgreementRecallText}
        onCommit={() => setAgreementRecallCommitted(true)}
        onAssess={(assessment) => { setAgreementRecallAssessment(assessment); unlock(5); }}
        onRewrite={() => { setAgreementRecallCommitted(false); setAgreementRecallAssessment(null); }}
        onContinue={() => unlockAndGo(5)}
      />;
      break;
    case 5:
      screen = <NameEncodingStep
        revealed={encodingRevealed}
        onReveal={() => { setEncodingRevealed(true); unlock(6); }}
        onContinue={() => unlockAndGo(6)}
      />;
      break;
    case 6:
      screen = <RoundTripStep
        encodeInputs={roundTripEncodeInputs}
        decodeInput={decodeRocketInput}
        onEncodeChange={updateRoundTripEncode}
        onDecodeChange={updateDecodeRocket}
        onContinue={() => unlockAndGo(7)}
      />;
      break;
    case 7:
      screen = <CountWasteStep
        totalInput={costTotalInput}
        zeroInput={costZeroInput}
        onTotalChange={updateCostTotal}
        onZeroChange={updateCostZero}
        onFinish={() => unlockAndGo(8)}
      />;
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
