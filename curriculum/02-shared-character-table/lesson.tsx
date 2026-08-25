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
  DEFAULT_SHARED_TABLE,
  SHARED_CHARACTER_TABLE_STEPS,
  SHARED_CHARACTER_TABLE_STORAGE_KEY,
  WEIRD_SHARED_TABLE,
} from "./config";
import { CompleteStep } from "./steps/Complete";
import { InspectRulesStep } from "./steps/InspectRules";
import { ManualFixStep } from "./steps/ManualFix";
import { MessageChallengeStep } from "./steps/MessageChallenge";
import { MismatchStep } from "./steps/Mismatch";
import { NumbersMatterStep } from "./steps/NumbersMatter";
import { SharedTableStep } from "./steps/SharedTable";
import type {
  AgreementAnswer,
  MappingTable,
  MismatchReason,
  ScaleChoice,
  SharedCharacterTablePersistedState,
  SymbolKey,
} from "./types";

const STEP_COUNT = SHARED_CHARACTER_TABLE_STEPS.length;

function isMappingTable(value: unknown): value is MappingTable {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<MappingTable>;
  return (["A", "B", "C"] as SymbolKey[]).every((symbol) => (
    typeof candidate[symbol] === "number" && Number.isFinite(candidate[symbol])
  ));
}

function isEncodedValues(value: unknown): value is Array<number | null> {
  return Array.isArray(value)
    && value.length === 3
    && value.every((item) => item === null || typeof item === "number");
}

export function SharedCharacterTableLesson() {
  const [hasHydrated, setHasHydrated] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [highestUnlocked, setHighestUnlocked] = useState(0);
  const [mismatchSent, setMismatchSent] = useState(false);
  const [mismatchReason, setMismatchReason] = useState<MismatchReason>(null);
  const [instructionsAttached, setInstructionsAttached] = useState(false);
  const [scaleChoice, setScaleChoice] = useState<ScaleChoice>(null);
  const [sharedTable, setSharedTable] = useState<MappingTable>({ ...DEFAULT_SHARED_TABLE });
  const [sharedApplied, setSharedApplied] = useState(false);
  const [sharedSent, setSharedSent] = useState(false);
  const [weirdApplied, setWeirdApplied] = useState(false);
  const [weirdTested, setWeirdTested] = useState(false);
  const [agreementAnswer, setAgreementAnswer] = useState<AgreementAnswer>(null);
  const [encodedValues, setEncodedValues] = useState<Array<number | null>>([null, null, null]);
  const [messageSent, setMessageSent] = useState(false);
  const [receiverBroken, setReceiverBroken] = useState(false);

  useEffect(() => {
    const saved = readPersistedLessonState<SharedCharacterTablePersistedState>(
      SHARED_CHARACTER_TABLE_STORAGE_KEY,
    );
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
    setMismatchSent(saved?.mismatchSent === true);
    setMismatchReason(saved?.mismatchReason === "changed" || saved?.mismatchReason === "rules" || saved?.mismatchReason === "binary" ? saved.mismatchReason : null);
    setInstructionsAttached(saved?.instructionsAttached === true);
    setScaleChoice(saved?.scaleChoice === "instructions" || saved?.scaleChoice === "agree" ? saved.scaleChoice : null);
    setSharedTable(isMappingTable(saved?.sharedTable) ? saved.sharedTable : { ...DEFAULT_SHARED_TABLE });
    setSharedApplied(saved?.sharedApplied === true);
    setSharedSent(saved?.sharedSent === true);
    setWeirdApplied(saved?.weirdApplied === true);
    setWeirdTested(saved?.weirdTested === true);
    setAgreementAnswer(saved?.agreementAnswer === "intrinsic" || saved?.agreementAnswer === "shared" ? saved.agreementAnswer : null);
    setEncodedValues(isEncodedValues(saved?.encodedValues) ? saved.encodedValues : [null, null, null]);
    setMessageSent(saved?.messageSent === true);
    setReceiverBroken(saved?.receiverBroken === true);
    writeStepToUrl(restoredCurrent, "replace");
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;
    const state: SharedCharacterTablePersistedState = {
      currentStep,
      highestUnlocked,
      mismatchSent,
      mismatchReason,
      instructionsAttached,
      scaleChoice,
      sharedTable,
      sharedApplied,
      sharedSent,
      weirdApplied,
      weirdTested,
      agreementAnswer,
      encodedValues,
      messageSent,
      receiverBroken,
    };
    writePersistedLessonState(SHARED_CHARACTER_TABLE_STORAGE_KEY, state);
  }, [
    hasHydrated,
    currentStep,
    highestUnlocked,
    mismatchSent,
    mismatchReason,
    instructionsAttached,
    scaleChoice,
    sharedTable,
    sharedApplied,
    sharedSent,
    weirdApplied,
    weirdTested,
    agreementAnswer,
    encodedValues,
    messageSent,
    receiverBroken,
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

  function updateSharedValue(symbol: SymbolKey, value: number) {
    setSharedTable((current) => ({ ...current, [symbol]: value }));
    setSharedApplied(false);
    setSharedSent(false);
  }

  function makeWeirdTable() {
    setSharedTable({ ...WEIRD_SHARED_TABLE });
    setWeirdApplied(true);
    setWeirdTested(false);
    setAgreementAnswer(null);
    setEncodedValues([null, null, null]);
    setMessageSent(false);
    setReceiverBroken(false);
  }

  function restartLesson() {
    setCurrentStep(0);
    setHighestUnlocked(0);
    setMismatchSent(false);
    setMismatchReason(null);
    setInstructionsAttached(false);
    setScaleChoice(null);
    setSharedTable({ ...DEFAULT_SHARED_TABLE });
    setSharedApplied(false);
    setSharedSent(false);
    setWeirdApplied(false);
    setWeirdTested(false);
    setAgreementAnswer(null);
    setEncodedValues([null, null, null]);
    setMessageSent(false);
    setReceiverBroken(false);
    clearPersistedLessonState(SHARED_CHARACTER_TABLE_STORAGE_KEY);
    if (hasHydrated) writeStepToUrl(0, "replace");
  }

  if (!hasHydrated) return <main className="app-shell" aria-busy="true" />;

  let screen;
  switch (currentStep) {
    case 0:
      screen = <MismatchStep sent={mismatchSent} onSend={() => { setMismatchSent(true); unlock(1); }} onContinue={() => unlockAndGo(1)} />;
      break;
    case 1:
      screen = (
        <InspectRulesStep
          answer={mismatchReason}
          onAnswer={(answer) => { setMismatchReason(answer); if (answer === "rules") unlock(2); }}
          onContinue={() => unlockAndGo(2)}
        />
      );
      break;
    case 2:
      screen = (
        <ManualFixStep
          attached={instructionsAttached}
          choice={scaleChoice}
          onAttach={() => setInstructionsAttached(true)}
          onChoice={(choice) => { setScaleChoice(choice); if (choice === "agree") unlock(3); }}
          onContinue={() => unlockAndGo(3)}
        />
      );
      break;
    case 3:
      screen = (
        <SharedTableStep
          table={sharedTable}
          applied={sharedApplied}
          sent={sharedSent}
          onChange={updateSharedValue}
          onApply={() => { setSharedApplied(true); setSharedSent(false); }}
          onSend={() => { setSharedSent(true); unlock(4); }}
          onContinue={() => unlockAndGo(4)}
        />
      );
      break;
    case 4:
      screen = (
        <NumbersMatterStep
          table={sharedTable}
          weirdApplied={weirdApplied}
          tested={weirdTested}
          answer={agreementAnswer}
          onMakeWeird={makeWeirdTable}
          onTest={() => setWeirdTested(true)}
          onAnswer={(answer) => { setAgreementAnswer(answer); if (answer === "shared") unlock(5); }}
          onContinue={() => unlockAndGo(5)}
        />
      );
      break;
    case 5:
      screen = (
        <MessageChallengeStep
          table={sharedTable}
          encodedValues={encodedValues}
          messageSent={messageSent}
          receiverBroken={receiverBroken}
          onChoose={(index, value) => setEncodedValues((current) => current.map((item, itemIndex) => itemIndex === index ? value : item))}
          onSend={() => setMessageSent(true)}
          onBreakReceiver={() => { setReceiverBroken(true); unlock(6); }}
          onFinish={() => unlockAndGo(6)}
        />
      );
      break;
    default:
      screen = <CompleteStep onRestart={restartLesson} />;
  }

  return (
    <LessonPlayer
      lessonNumber={2}
      title="Why computers need a shared character table"
      stepLabels={SHARED_CHARACTER_TABLE_STEPS}
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
