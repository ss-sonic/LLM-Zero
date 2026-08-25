"use client";

import { useEffect, useState } from "react";
import { LessonPlayer } from "../../components/lesson/LessonPlayer";
import { readStepFromUrl, writeStepToUrl } from "../../lib/lesson/navigation";
import { clearPersistedLessonState, readPersistedLessonState, writePersistedLessonState } from "../../lib/lesson/persistence";
import { clampStep } from "../../lib/lesson/progress";
import {
  A_BYTE_HEX,
  A_CODE_POINT_DECIMAL,
  BUILD_TARGETS,
  COMPRESSION_HEX,
  FORWARD_HEX,
  HEXADECIMAL_BRIDGE_STEPS,
  HEXADECIMAL_BRIDGE_STORAGE_KEY,
  PAIN_DIFFERENCE_INDEX,
  REVERSE_BITS,
} from "./config";
import { isNibbleBits, normalizeHex } from "./hex";
import type { HexadecimalBridgePersistedState } from "./types";
import { BinaryPainStep } from "./steps/BinaryPain";
import { FourBitsStep } from "./steps/FourBits";
import { SixDigitsStep } from "./steps/SixDigits";
import { BuildDigitsStep } from "./steps/BuildDigits";
import { ByteToHexStep } from "./steps/ByteToHex";
import { ConvertBothWaysStep } from "./steps/ConvertBothWays";
import { CompressBytesStep } from "./steps/CompressBytes";
import { CompleteStep } from "./steps/Complete";

const STEP_COUNT = HEXADECIMAL_BRIDGE_STEPS.length;
const emptyNibble = () => ["0", "0", "0", "0"];
const emptyInputs = (count: number) => Array.from({ length: count }, () => "");

function safeStrings(value: unknown, count: number) {
  if (!Array.isArray(value) || value.length !== count) return emptyInputs(count);
  return value.map((item) => typeof item === "string" ? item : "");
}

export function HexadecimalBridge() {
  const [hasHydrated, setHasHydrated] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [highestUnlocked, setHighestUnlocked] = useState(0);
  const [painGuess, setPainGuess] = useState<number | null>(null);
  const [nibbleBits, setNibbleBits] = useState<string[]>(emptyNibble());
  const [patternCount, setPatternCount] = useState("");
  const [symbolsRevealed, setSymbolsRevealed] = useState(false);
  const [builderBits, setBuilderBits] = useState<string[]>(emptyNibble());
  const [builtTargets, setBuiltTargets] = useState<string[]>([]);
  const [byteHex, setByteHex] = useState<string[]>(emptyInputs(2));
  const [byteDecimal, setByteDecimal] = useState("");
  const [forwardHex, setForwardHex] = useState<string[]>(emptyInputs(2));
  const [reverseBits, setReverseBits] = useState<string[]>(emptyInputs(2));
  const [compressedHex, setCompressedHex] = useState<string[]>(emptyInputs(4));

  useEffect(() => {
    const saved = readPersistedLessonState<HexadecimalBridgePersistedState>(HEXADECIMAL_BRIDGE_STORAGE_KEY);
    const restoredHighest = clampStep(typeof saved?.highestUnlocked === "number" ? saved.highestUnlocked : 0, STEP_COUNT - 1, STEP_COUNT);
    const requestedStep = readStepFromUrl();
    const restoredCurrent = clampStep(requestedStep ?? (typeof saved?.currentStep === "number" ? saved.currentStep : 0), restoredHighest, STEP_COUNT);

    setCurrentStep(restoredCurrent);
    setHighestUnlocked(restoredHighest);
    setPainGuess(typeof saved?.painGuess === "number" ? saved.painGuess : null);
    setNibbleBits(isNibbleBits(saved?.nibbleBits) ? saved.nibbleBits : emptyNibble());
    setPatternCount(typeof saved?.patternCount === "string" ? saved.patternCount : "");
    setSymbolsRevealed(saved?.symbolsRevealed === true);
    setBuilderBits(isNibbleBits(saved?.builderBits) ? saved.builderBits : emptyNibble());
    setBuiltTargets(Array.isArray(saved?.builtTargets) ? saved.builtTargets.filter((item): item is string => typeof item === "string") : []);
    setByteHex(safeStrings(saved?.byteHex, 2));
    setByteDecimal(typeof saved?.byteDecimal === "string" ? saved.byteDecimal : "");
    setForwardHex(safeStrings(saved?.forwardHex, 2));
    setReverseBits(safeStrings(saved?.reverseBits, 2));
    setCompressedHex(safeStrings(saved?.compressedHex, 4));
    writeStepToUrl(restoredCurrent, "replace");
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;
    writePersistedLessonState<HexadecimalBridgePersistedState>(HEXADECIMAL_BRIDGE_STORAGE_KEY, {
      currentStep, highestUnlocked, painGuess, nibbleBits, patternCount, symbolsRevealed,
      builderBits, builtTargets, byteHex, byteDecimal, forwardHex, reverseBits, compressedHex,
    });
  }, [hasHydrated, currentStep, highestUnlocked, painGuess, nibbleBits, patternCount, symbolsRevealed, builderBits, builtTargets, byteHex, byteDecimal, forwardHex, reverseBits, compressedHex]);

  useEffect(() => {
    if (!hasHydrated) return;
    function handlePopState() {
      const requested = readStepFromUrl();
      if (requested === null) return;
      const safe = clampStep(requested, highestUnlocked, STEP_COUNT);
      setCurrentStep(safe);
      if (safe !== requested) writeStepToUrl(safe, "replace");
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

  function updatePainGuess(index: number) {
    setPainGuess(index);
    if (index === PAIN_DIFFERENCE_INDEX) unlock(1);
  }

  function toggleNibble(index: number) {
    setNibbleBits((current) => current.map((bit, bitIndex) => bitIndex === index ? (bit === "1" ? "0" : "1") : bit));
  }

  function updatePatternCount(value: string) {
    setPatternCount(value);
    if (nibbleBits.every((bit) => bit === "1") && Number(value) === 16) unlock(2);
  }

  function toggleBuilder(index: number) {
    setBuilderBits((current) => {
      const next = current.map((bit, bitIndex) => bitIndex === index ? (bit === "1" ? "0" : "1") : bit);
      const target = BUILD_TARGETS.find((item) => !builtTargets.includes(item.hex));
      if (target && next.join("") === target.bits) {
        const updated = [...builtTargets, target.hex];
        setBuiltTargets(updated);
        if (updated.length === BUILD_TARGETS.length) unlock(4);
      }
      return next;
    });
  }

  function updateByteHex(index: number, value: string) {
    setByteHex((current) => {
      const next = current.map((item, itemIndex) => itemIndex === index ? value : item);
      if (next.every((item, itemIndex) => normalizeHex(item) === A_BYTE_HEX[itemIndex]) && Number(byteDecimal) === A_CODE_POINT_DECIMAL) unlock(5);
      return next;
    });
  }
  function updateByteDecimal(value: string) {
    setByteDecimal(value);
    if (Number(value) === A_CODE_POINT_DECIMAL && byteHex.every((item, itemIndex) => normalizeHex(item) === A_BYTE_HEX[itemIndex])) unlock(5);
  }

  function updateForwardHex(index: number, value: string) {
    setForwardHex((current) => {
      const next = current.map((item, itemIndex) => itemIndex === index ? value : item);
      if (next.every((item, itemIndex) => normalizeHex(item) === FORWARD_HEX[itemIndex]) && reverseBits.every((item, itemIndex) => item.trim() === REVERSE_BITS[itemIndex])) unlock(6);
      return next;
    });
  }
  function updateReverseBits(index: number, value: string) {
    setReverseBits((current) => {
      const next = current.map((item, itemIndex) => itemIndex === index ? value : item);
      if (next.every((item, itemIndex) => item.trim() === REVERSE_BITS[itemIndex]) && forwardHex.every((item, itemIndex) => normalizeHex(item) === FORWARD_HEX[itemIndex])) unlock(6);
      return next;
    });
  }

  function updateCompressed(index: number, value: string) {
    setCompressedHex((current) => {
      const next = current.map((item, itemIndex) => itemIndex === index ? value : item);
      if (next.every((item, itemIndex) => normalizeHex(item) === COMPRESSION_HEX[itemIndex])) unlock(7);
      return next;
    });
  }

  function restartLesson() {
    setCurrentStep(0); setHighestUnlocked(0); setPainGuess(null); setNibbleBits(emptyNibble()); setPatternCount("");
    setSymbolsRevealed(false); setBuilderBits(emptyNibble()); setBuiltTargets([]); setByteHex(emptyInputs(2)); setByteDecimal("");
    setForwardHex(emptyInputs(2)); setReverseBits(emptyInputs(2)); setCompressedHex(emptyInputs(4));
    clearPersistedLessonState(HEXADECIMAL_BRIDGE_STORAGE_KEY);
    if (hasHydrated) writeStepToUrl(0, "replace");
  }

  if (!hasHydrated) return <main className="app-shell" aria-busy="true" />;

  let screen;
  switch (currentStep) {
    case 0: screen = <BinaryPainStep guess={painGuess} onGuess={updatePainGuess} onContinue={() => unlockAndGo(1)} />; break;
    case 1: screen = <FourBitsStep bits={nibbleBits} patternCount={patternCount} onToggle={toggleNibble} onPatternCount={updatePatternCount} onContinue={() => unlockAndGo(2)} />; break;
    case 2: screen = <SixDigitsStep revealed={symbolsRevealed} onReveal={() => { setSymbolsRevealed(true); unlock(3); }} onContinue={() => unlockAndGo(3)} />; break;
    case 3: screen = <BuildDigitsStep bits={builderBits} builtTargets={builtTargets} onToggle={toggleBuilder} onContinue={() => unlockAndGo(4)} />; break;
    case 4: screen = <ByteToHexStep hexValues={byteHex} decimalValue={byteDecimal} onHexChange={updateByteHex} onDecimalChange={updateByteDecimal} onContinue={() => unlockAndGo(5)} />; break;
    case 5: screen = <ConvertBothWaysStep forwardHex={forwardHex} reverseBits={reverseBits} onForwardChange={updateForwardHex} onReverseChange={updateReverseBits} onContinue={() => unlockAndGo(6)} />; break;
    case 6: screen = <CompressBytesStep values={compressedHex} onChange={updateCompressed} onContinue={() => unlockAndGo(7)} />; break;
    default: screen = <CompleteStep onRestart={restartLesson} />;
  }

  return (
    <LessonPlayer
      kicker="Foundation bridge"
      title="Hexadecimal is shorthand for bits"
      stepLabels={HEXADECIMAL_BRIDGE_STEPS}
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
