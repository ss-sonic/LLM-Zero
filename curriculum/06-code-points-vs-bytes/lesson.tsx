"use client";

import { useState } from "react";
import { LessonPlayer } from "../../components/lesson/LessonPlayer";
import type { RecallAssessment } from "../../components/ui/TextRecall";
import { bitsToNumber, emptyByte, isBitArray } from "../../lib/lesson/binary";
import { useLessonProgress } from "../../lib/lesson/useLessonProgress";
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

  const progress = useLessonProgress<CodePointsVsBytesPersistedState>({
    storageKey: CODE_POINTS_VS_BYTES_STORAGE_KEY,
    stepCount: STEP_COUNT,
    lessonState: {
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
    },
    onRestore: (saved) => {
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
    },
    onReset: () => {
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
    },
  });

  function toggleBit(index: number) {
    setByteBits((current) => current.map((bit, bitIndex) => bitIndex === index ? (bit === "1" ? "0" : "1") : bit));
  }

  function updatePatternCount(value: string) {
    setPatternCountInput(value);
    if (bitsToNumber(byteBits) === 255 && Number(value) === 256) progress.unlock(2);
  }

  function updateStorageInput(index: number, value: string) {
    const next = storageInputs.map((item, itemIndex) => itemIndex === index ? value : item);
    setStorageInputs(next);

    const numbers = next.map(Number);
    const solved = next.every((item) => item.trim() !== "")
      && numbers.every(isByteValue)
      && decodeFixedWidth(numbers) === ROCKET.decimal;
    if (solved) progress.unlock(3);
  }

  function inspectWidth(width: number) {
    setInspectedWidths((current) => current.includes(width) ? current : [...current, width]);
  }

  function updateRoundTripEncode(index: number, value: string) {
    const next = roundTripEncodeInputs.map((item, itemIndex) => itemIndex === index ? value : item);
    setRoundTripEncodeInputs(next);

    const encodeCorrect = ROCKET_BYTES.every((byte, byteIndex) => next[byteIndex].trim() !== "" && Number(next[byteIndex]) === byte);
    if (encodeCorrect && Number(decodeRocketInput) === ROCKET.decimal) progress.unlock(7);
  }

  function updateDecodeRocket(value: string) {
    setDecodeRocketInput(value);
    const encodeCorrect = ROCKET_BYTES.every((byte, index) => roundTripEncodeInputs[index].trim() !== "" && Number(roundTripEncodeInputs[index]) === byte);
    if (encodeCorrect && Number(value) === ROCKET.decimal) progress.unlock(7);
  }

  function updateCostTotal(value: string) {
    setCostTotalInput(value);
    if (Number(value) === COST_TOTAL && Number(costZeroInput) === COST_ZEROS) progress.unlock(8);
  }

  function updateCostZero(value: string) {
    setCostZeroInput(value);
    if (Number(value) === COST_ZEROS && Number(costTotalInput) === COST_TOTAL) progress.unlock(8);
  }

  if (!progress.hasHydrated) return <main className="app-shell" aria-busy="true" />;

  let screen;
  switch (progress.currentStep) {
    case 0:
      screen = <ResumeProblemStep
        recallText={unicodeRecallText}
        committed={unicodeRecallCommitted}
        assessment={unicodeRecallAssessment}
        onChange={setUnicodeRecallText}
        onCommit={() => setUnicodeRecallCommitted(true)}
        onAssess={(assessment) => { setUnicodeRecallAssessment(assessment); progress.unlock(1); }}
        onRewrite={() => { setUnicodeRecallCommitted(false); setUnicodeRecallAssessment(null); }}
        onContinue={() => progress.unlockAndGo(1)}
      />;
      break;
    case 1:
      screen = <ByteLimitStep
        bits={byteBits}
        patternCountInput={patternCountInput}
        onToggleBit={toggleBit}
        onPatternCountChange={updatePatternCount}
        onContinue={() => progress.unlockAndGo(2)}
      />;
      break;
    case 2:
      screen = <InventStorageStep values={storageInputs} onChange={updateStorageInput} onContinue={() => progress.unlockAndGo(3)} />;
      break;
    case 3:
      screen = <ChangeRuleStep
        inspectedWidths={inspectedWidths}
        conclusion={ruleConclusion}
        onInspect={inspectWidth}
        onConclusion={(answer) => { setRuleConclusion(answer); if (answer === "rule") progress.unlock(4); }}
        onContinue={() => progress.unlockAndGo(4)}
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
        onAssess={(assessment) => { setAgreementRecallAssessment(assessment); progress.unlock(5); }}
        onRewrite={() => { setAgreementRecallCommitted(false); setAgreementRecallAssessment(null); }}
        onContinue={() => progress.unlockAndGo(5)}
      />;
      break;
    case 5:
      screen = <NameEncodingStep
        revealed={encodingRevealed}
        onReveal={() => { setEncodingRevealed(true); progress.unlock(6); }}
        onContinue={() => progress.unlockAndGo(6)}
      />;
      break;
    case 6:
      screen = <RoundTripStep
        encodeInputs={roundTripEncodeInputs}
        decodeInput={decodeRocketInput}
        onEncodeChange={updateRoundTripEncode}
        onDecodeChange={updateDecodeRocket}
        onContinue={() => progress.unlockAndGo(7)}
      />;
      break;
    case 7:
      screen = <CountWasteStep
        totalInput={costTotalInput}
        zeroInput={costZeroInput}
        onTotalChange={updateCostTotal}
        onZeroChange={updateCostZero}
        onFinish={() => progress.unlockAndGo(8)}
      />;
      break;
    default:
      screen = <CompleteStep onRestart={progress.restart} />;
  }

  return (
    <LessonPlayer
      lessonNumber={6}
      lessonSlug="code-points-vs-bytes"
      title="A code point is not a byte"
      stepLabels={CODE_POINTS_VS_BYTES_STEPS}
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
