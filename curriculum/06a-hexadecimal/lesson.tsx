"use client";

import { useState } from "react";
import { LessonPlayer } from "../../components/lesson/LessonPlayer";
import { useLessonProgress } from "../../lib/lesson/useLessonProgress";
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

  const progress = useLessonProgress<HexadecimalBridgePersistedState>({
    storageKey: HEXADECIMAL_BRIDGE_STORAGE_KEY,
    stepCount: STEP_COUNT,
    lessonState: {
      painGuess, nibbleBits, patternCount, symbolsRevealed, builderBits, builtTargets,
      byteHex, byteDecimal, forwardHex, reverseBits, compressedHex,
    },
    onRestore: (saved) => {
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
    },
    onReset: () => {
      setPainGuess(null);
      setNibbleBits(emptyNibble());
      setPatternCount("");
      setSymbolsRevealed(false);
      setBuilderBits(emptyNibble());
      setBuiltTargets([]);
      setByteHex(emptyInputs(2));
      setByteDecimal("");
      setForwardHex(emptyInputs(2));
      setReverseBits(emptyInputs(2));
      setCompressedHex(emptyInputs(4));
    },
  });

  function updatePainGuess(index: number) {
    setPainGuess(index);
    if (index === PAIN_DIFFERENCE_INDEX) progress.unlock(1);
  }

  function toggleNibble(index: number) {
    const next = nibbleBits.map((bit, bitIndex) => bitIndex === index ? (bit === "1" ? "0" : "1") : bit);
    setNibbleBits(next);
    if (next.every((bit) => bit === "1") && Number(patternCount) === 16) progress.unlock(2);
  }

  function updatePatternCount(value: string) {
    setPatternCount(value);
    if (nibbleBits.every((bit) => bit === "1") && Number(value) === 16) progress.unlock(2);
  }

  function toggleBuilder(index: number) {
    const next = builderBits.map((bit, bitIndex) => bitIndex === index ? (bit === "1" ? "0" : "1") : bit);
    setBuilderBits(next);

    const target = BUILD_TARGETS.find((item) => !builtTargets.includes(item.hex));
    if (!target || next.join("") !== target.bits) return;

    const updated = [...builtTargets, target.hex];
    setBuiltTargets(updated);
    if (updated.length === BUILD_TARGETS.length) progress.unlock(4);
  }

  function updateByteHex(index: number, value: string) {
    const next = byteHex.map((item, itemIndex) => itemIndex === index ? value : item);
    setByteHex(next);
    if (next.every((item, itemIndex) => normalizeHex(item) === A_BYTE_HEX[itemIndex]) && Number(byteDecimal) === A_CODE_POINT_DECIMAL) progress.unlock(5);
  }
  function updateByteDecimal(value: string) {
    setByteDecimal(value);
    if (Number(value) === A_CODE_POINT_DECIMAL && byteHex.every((item, itemIndex) => normalizeHex(item) === A_BYTE_HEX[itemIndex])) progress.unlock(5);
  }

  function updateForwardHex(index: number, value: string) {
    const next = forwardHex.map((item, itemIndex) => itemIndex === index ? value : item);
    setForwardHex(next);
    if (next.every((item, itemIndex) => normalizeHex(item) === FORWARD_HEX[itemIndex]) && reverseBits.every((item, itemIndex) => item.trim() === REVERSE_BITS[itemIndex])) progress.unlock(6);
  }
  function updateReverseBits(index: number, value: string) {
    const next = reverseBits.map((item, itemIndex) => itemIndex === index ? value : item);
    setReverseBits(next);
    if (next.every((item, itemIndex) => item.trim() === REVERSE_BITS[itemIndex]) && forwardHex.every((item, itemIndex) => normalizeHex(item) === FORWARD_HEX[itemIndex])) progress.unlock(6);
  }

  function updateCompressed(index: number, value: string) {
    const next = compressedHex.map((item, itemIndex) => itemIndex === index ? value : item);
    setCompressedHex(next);
    if (next.every((item, itemIndex) => normalizeHex(item) === COMPRESSION_HEX[itemIndex])) progress.unlock(7);
  }

  if (!progress.hasHydrated) return <main className="app-shell" aria-busy="true" />;

  let screen;
  switch (progress.currentStep) {
    case 0: screen = <BinaryPainStep guess={painGuess} onGuess={updatePainGuess} onContinue={() => progress.unlockAndGo(1)} />; break;
    case 1: screen = <FourBitsStep bits={nibbleBits} patternCount={patternCount} onToggle={toggleNibble} onPatternCount={updatePatternCount} onContinue={() => progress.unlockAndGo(2)} />; break;
    case 2: screen = <SixDigitsStep revealed={symbolsRevealed} onReveal={() => { setSymbolsRevealed(true); progress.unlock(3); }} onContinue={() => progress.unlockAndGo(3)} />; break;
    case 3: screen = <BuildDigitsStep bits={builderBits} builtTargets={builtTargets} onToggle={toggleBuilder} onContinue={() => progress.unlockAndGo(4)} />; break;
    case 4: screen = <ByteToHexStep hexValues={byteHex} decimalValue={byteDecimal} onHexChange={updateByteHex} onDecimalChange={updateByteDecimal} onContinue={() => progress.unlockAndGo(5)} />; break;
    case 5: screen = <ConvertBothWaysStep forwardHex={forwardHex} reverseBits={reverseBits} onForwardChange={updateForwardHex} onReverseChange={updateReverseBits} onContinue={() => progress.unlockAndGo(6)} />; break;
    case 6: screen = <CompressBytesStep values={compressedHex} onChange={updateCompressed} onContinue={() => progress.unlockAndGo(7)} />; break;
    default: screen = <CompleteStep onRestart={progress.restart} />;
  }

  return (
    <LessonPlayer
      kicker="Foundation bridge"
      lessonSlug="hexadecimal"
      title="Hexadecimal is shorthand for bits"
      stepLabels={HEXADECIMAL_BRIDGE_STEPS}
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
