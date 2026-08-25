"use client";

import { useEffect, useState } from "react";
import { LessonPlayer } from "../../components/lesson/LessonPlayer";
import type { RecallAssessment } from "../../components/ui/TextRecall";
import { readStepFromUrl, writeStepToUrl } from "../../lib/lesson/navigation";
import { clearPersistedLessonState, readPersistedLessonState, writePersistedLessonState } from "../../lib/lesson/persistence";
import { clampStep } from "../../lib/lesson/progress";
import { A, E_ACUTE, ROCKET, UTF8_PATTERNS, UTF8_STEPS, UTF8_STORAGE_KEY } from "./config";
import type { Utf8PersistedState } from "./types";
import { allMatch, normalizeBits, normalizeHex } from "./utf8";
import { WasteStep } from "./steps/Waste";
import { BoundaryStep } from "./steps/Boundary";
import { PrefixesStep } from "./steps/Prefixes";
import { EncodeAStep } from "./steps/EncodeA";
import { WhyTwoBytesStep } from "./steps/WhyTwoBytes";
import { EncodeEStep } from "./steps/EncodeE";
import { DecodeEStep } from "./steps/DecodeE";
import { ChooseWidthStep } from "./steps/ChooseWidth";
import { BuildRocketStep } from "./steps/BuildRocket";
import { PrefixRecallStep } from "./steps/PrefixRecall";
import { CompleteStep } from "./steps/Complete";

const STEP_COUNT = UTF8_STEPS.length;
const empty = (count: number) => Array.from({ length: count }, () => "");
function safeStrings(value: unknown, count: number) { if (!Array.isArray(value) || value.length !== count) return empty(count); return value.map((item) => typeof item === "string" ? item : ""); }
function safeStringList(value: unknown) { return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []; }
function safeNumberList(value: unknown) { return Array.isArray(value) ? value.filter((item): item is number => typeof item === "number") : []; }
function safeAssessment(value: unknown): RecallAssessment { return value === "matched" || value === "missed" ? value : null; }

export function Utf8Lesson() {
  const [hasHydrated, setHasHydrated] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [highestUnlocked, setHighestUnlocked] = useState(0);
  const [wasteInput, setWasteInput] = useState("");
  const [boundarySeen, setBoundarySeen] = useState<string[]>([]);
  const [prefixSeen, setPrefixSeen] = useState<number[]>([]);
  const [aBitsInput, setABitsInput] = useState("");
  const [aHexInput, setAHexInput] = useState("");
  const [ePayloadInput, setEPayloadInput] = useState("");
  const [eBitLengthInput, setEBitLengthInput] = useState("");
  const [eEncodeGroups, setEEncodeGroups] = useState<string[]>(empty(2));
  const [eEncodeHex, setEEncodeHex] = useState<string[]>(empty(2));
  const [eDecodeGroups, setEDecodeGroups] = useState<string[]>(empty(2));
  const [eDecodeDecimal, setEDecodeDecimal] = useState("");
  const [capacities, setCapacities] = useState<string[]>(empty(4));
  const [rocketWidth, setRocketWidth] = useState("");
  const [rocketGroups, setRocketGroups] = useState<string[]>(empty(4));
  const [rocketHex, setRocketHex] = useState<string[]>(empty(4));
  const [prefixRecallText, setPrefixRecallText] = useState("");
  const [prefixRecallCommitted, setPrefixRecallCommitted] = useState(false);
  const [prefixRecallAssessment, setPrefixRecallAssessment] = useState<RecallAssessment>(null);

  useEffect(() => {
    const saved = readPersistedLessonState<Utf8PersistedState>(UTF8_STORAGE_KEY);
    const restoredHighest = clampStep(typeof saved?.highestUnlocked === "number" ? saved.highestUnlocked : 0, STEP_COUNT - 1, STEP_COUNT);
    const requested = readStepFromUrl();
    const restoredCurrent = clampStep(requested ?? (typeof saved?.currentStep === "number" ? saved.currentStep : 0), restoredHighest, STEP_COUNT);
    setCurrentStep(restoredCurrent); setHighestUnlocked(restoredHighest);
    setWasteInput(typeof saved?.wasteInput === "string" ? saved.wasteInput : "");
    setBoundarySeen(safeStringList(saved?.boundarySeen)); setPrefixSeen(safeNumberList(saved?.prefixSeen));
    setABitsInput(typeof saved?.aBitsInput === "string" ? saved.aBitsInput : ""); setAHexInput(typeof saved?.aHexInput === "string" ? saved.aHexInput : "");
    setEPayloadInput(typeof saved?.ePayloadInput === "string" ? saved.ePayloadInput : ""); setEBitLengthInput(typeof saved?.eBitLengthInput === "string" ? saved.eBitLengthInput : "");
    setEEncodeGroups(safeStrings(saved?.eEncodeGroups, 2)); setEEncodeHex(safeStrings(saved?.eEncodeHex, 2));
    setEDecodeGroups(safeStrings(saved?.eDecodeGroups, 2)); setEDecodeDecimal(typeof saved?.eDecodeDecimal === "string" ? saved.eDecodeDecimal : "");
    setCapacities(safeStrings(saved?.capacities, 4)); setRocketWidth(typeof saved?.rocketWidth === "string" ? saved.rocketWidth : "");
    setRocketGroups(safeStrings(saved?.rocketGroups, 4)); setRocketHex(safeStrings(saved?.rocketHex, 4));
    setPrefixRecallText(typeof saved?.prefixRecallText === "string" ? saved.prefixRecallText : ""); setPrefixRecallCommitted(saved?.prefixRecallCommitted === true); setPrefixRecallAssessment(safeAssessment(saved?.prefixRecallAssessment));
    writeStepToUrl(restoredCurrent, "replace"); setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;
    writePersistedLessonState<Utf8PersistedState>(UTF8_STORAGE_KEY, { currentStep, highestUnlocked, wasteInput, boundarySeen, prefixSeen, aBitsInput, aHexInput, ePayloadInput, eBitLengthInput, eEncodeGroups, eEncodeHex, eDecodeGroups, eDecodeDecimal, capacities, rocketWidth, rocketGroups, rocketHex, prefixRecallText, prefixRecallCommitted, prefixRecallAssessment });
  }, [hasHydrated, currentStep, highestUnlocked, wasteInput, boundarySeen, prefixSeen, aBitsInput, aHexInput, ePayloadInput, eBitLengthInput, eEncodeGroups, eEncodeHex, eDecodeGroups, eDecodeDecimal, capacities, rocketWidth, rocketGroups, rocketHex, prefixRecallText, prefixRecallCommitted, prefixRecallAssessment]);

  useEffect(() => {
    if (!hasHydrated) return;
    function onPop() { const requested = readStepFromUrl(); if (requested === null) return; const safe = clampStep(requested, highestUnlocked, STEP_COUNT); setCurrentStep(safe); if (safe !== requested) writeStepToUrl(safe, "replace"); }
    window.addEventListener("popstate", onPop); return () => window.removeEventListener("popstate", onPop);
  }, [hasHydrated, highestUnlocked]);

  function unlock(step: number) { setHighestUnlocked((current) => Math.min(STEP_COUNT - 1, Math.max(current, step))); }
  function goTo(step: number, mode: "push" | "replace" = "push") { if (step < 0 || step > highestUnlocked) return; setCurrentStep(step); if (hasHydrated) writeStepToUrl(step, mode); }
  function unlockAndGo(step: number) { unlock(step); setCurrentStep(step); if (hasHydrated) writeStepToUrl(step, "push"); }
  function updateArray(setter: React.Dispatch<React.SetStateAction<string[]>>, index: number, value: string, test: (next: string[]) => boolean, unlockStep: number) { setter((current) => { const next = current.map((item, i) => i === index ? value : item); if (test(next)) unlock(unlockStep); return next; }); }

  function restartLesson() {
    setCurrentStep(0); setHighestUnlocked(0); setWasteInput(""); setBoundarySeen([]); setPrefixSeen([]); setABitsInput(""); setAHexInput(""); setEPayloadInput(""); setEBitLengthInput("");
    setEEncodeGroups(empty(2)); setEEncodeHex(empty(2)); setEDecodeGroups(empty(2)); setEDecodeDecimal(""); setCapacities(empty(4)); setRocketWidth(""); setRocketGroups(empty(4)); setRocketHex(empty(4)); setPrefixRecallText(""); setPrefixRecallCommitted(false); setPrefixRecallAssessment(null);
    clearPersistedLessonState(UTF8_STORAGE_KEY); if (hasHydrated) writeStepToUrl(0, "replace");
  }

  if (!hasHydrated) return <main className="app-shell" aria-busy="true" />;

  let screen;
  switch (currentStep) {
    case 0: screen = <WasteStep value={wasteInput} onChange={(value) => { setWasteInput(value); if (Number(value) === 9) unlock(1); }} onContinue={() => unlockAndGo(1)} />; break;
    case 1: screen = <BoundaryStep seen={boundarySeen} onInspect={(id) => { setBoundarySeen((current) => { const next = current.includes(id) ? current : [...current, id]; if (new Set(next).size >= 2) unlock(2); return next; }); }} onContinue={() => unlockAndGo(2)} />; break;
    case 2: screen = <PrefixesStep seen={prefixSeen} onInspect={(width) => { setPrefixSeen((current) => { const next = current.includes(width) ? current : [...current, width]; if (new Set(next).size === UTF8_PATTERNS.length) unlock(3); return next; }); }} onContinue={() => unlockAndGo(3)} />; break;
    case 3: screen = <EncodeAStep bits={aBitsInput} hex={aHexInput} onBits={(value) => { setABitsInput(value); if (normalizeBits(value) === A.utf8Bits && normalizeHex(aHexInput) === A.utf8Hex) unlock(4); }} onHex={(value) => { setAHexInput(value); if (normalizeHex(value) === A.utf8Hex && normalizeBits(aBitsInput) === A.utf8Bits) unlock(4); }} onContinue={() => unlockAndGo(4)} />; break;
    case 4: screen = <WhyTwoBytesStep payload={ePayloadInput} bitLength={eBitLengthInput} onPayload={(value) => { setEPayloadInput(value); if (Number(value) === 7 && Number(eBitLengthInput) === 8) unlock(5); }} onBitLength={(value) => { setEBitLengthInput(value); if (Number(value) === 8 && Number(ePayloadInput) === 7) unlock(5); }} onContinue={() => unlockAndGo(5)} />; break;
    case 5: screen = <EncodeEStep groups={eEncodeGroups} hex={eEncodeHex} onGroup={(index, value) => updateArray(setEEncodeGroups, index, value, (next) => allMatch(next, E_ACUTE.payloadGroups, normalizeBits) && allMatch(eEncodeHex, E_ACUTE.utf8Hex, normalizeHex), 6)} onHex={(index, value) => updateArray(setEEncodeHex, index, value, (next) => allMatch(next, E_ACUTE.utf8Hex, normalizeHex) && allMatch(eEncodeGroups, E_ACUTE.payloadGroups, normalizeBits), 6)} onContinue={() => unlockAndGo(6)} />; break;
    case 6: screen = <DecodeEStep groups={eDecodeGroups} decimal={eDecodeDecimal} onGroup={(index, value) => updateArray(setEDecodeGroups, index, value, (next) => allMatch(next, E_ACUTE.payloadGroups, normalizeBits) && Number(eDecodeDecimal) === E_ACUTE.decimal, 7)} onDecimal={(value) => { setEDecodeDecimal(value); if (Number(value) === E_ACUTE.decimal && allMatch(eDecodeGroups, E_ACUTE.payloadGroups, normalizeBits)) unlock(7); }} onContinue={() => unlockAndGo(7)} />; break;
    case 7: screen = <ChooseWidthStep capacities={capacities} width={rocketWidth} onCapacity={(index, value) => updateArray(setCapacities, index, value, (next) => UTF8_PATTERNS.every((pattern, i) => Number(next[i]) === pattern.payloadBits) && Number(rocketWidth) === 4, 8)} onWidth={(value) => { setRocketWidth(value); if (Number(value) === 4 && UTF8_PATTERNS.every((pattern, i) => Number(capacities[i]) === pattern.payloadBits)) unlock(8); }} onContinue={() => unlockAndGo(8)} />; break;
    case 8: screen = <BuildRocketStep groups={rocketGroups} hex={rocketHex} onGroup={(index, value) => updateArray(setRocketGroups, index, value, (next) => allMatch(next, ROCKET.payloadGroups, normalizeBits) && allMatch(rocketHex, ROCKET.utf8Hex, normalizeHex), 9)} onHex={(index, value) => updateArray(setRocketHex, index, value, (next) => allMatch(next, ROCKET.utf8Hex, normalizeHex) && allMatch(rocketGroups, ROCKET.payloadGroups, normalizeBits), 9)} onContinue={() => unlockAndGo(9)} />; break;
    case 9: screen = <PrefixRecallStep value={prefixRecallText} committed={prefixRecallCommitted} assessment={prefixRecallAssessment} onChange={setPrefixRecallText} onCommit={() => setPrefixRecallCommitted(true)} onAssess={(assessment) => { setPrefixRecallAssessment(assessment); unlock(10); }} onRewrite={() => { setPrefixRecallCommitted(false); setPrefixRecallAssessment(null); }} onContinue={() => unlockAndGo(10)} />; break;
    default: screen = <CompleteStep onRestart={restartLesson} />;
  }

  return <LessonPlayer lessonNumber={7} title="Build UTF-8 by hand" stepLabels={UTF8_STEPS} currentStep={currentStep} highestUnlocked={highestUnlocked} onNavigate={(step) => goTo(step)} onBack={() => goTo(Math.max(0, currentStep - 1))} onRestart={restartLesson}>{screen}</LessonPlayer>;
}
