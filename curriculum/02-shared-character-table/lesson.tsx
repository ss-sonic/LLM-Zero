"use client";

import { useState } from "react";
import { LessonPlayer } from "../../components/lesson/LessonPlayer";
import type { RecallAssessment } from "../../components/ui/TextRecall";
import { useLessonProgress } from "../../lib/lesson/useLessonProgress";
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

function isAssessment(value: unknown): value is RecallAssessment {
  return value === "matched" || value === "missed" || value === null;
}

export function SharedCharacterTableLesson() {
  const [mismatchSent, setMismatchSent] = useState(false);
  const [mismatchReason, setMismatchReason] = useState<MismatchReason>(null);
  const [instructionsAttached, setInstructionsAttached] = useState(false);
  const [scaleChoice, setScaleChoice] = useState<ScaleChoice>(null);
  const [sharedTable, setSharedTable] = useState<MappingTable>({ ...DEFAULT_SHARED_TABLE });
  const [sharedApplied, setSharedApplied] = useState(false);
  const [sharedSent, setSharedSent] = useState(false);
  const [weirdApplied, setWeirdApplied] = useState(false);
  const [weirdTested, setWeirdTested] = useState(false);
  const [agreementRecall, setAgreementRecall] = useState("");
  const [agreementCommitted, setAgreementCommitted] = useState(false);
  const [agreementAssessment, setAgreementAssessment] = useState<RecallAssessment>(null);
  const [encodedValues, setEncodedValues] = useState<Array<number | null>>([null, null, null]);
  const [messageSent, setMessageSent] = useState(false);
  const [receiverBroken, setReceiverBroken] = useState(false);

  const progress = useLessonProgress<SharedCharacterTablePersistedState>({
    storageKey: SHARED_CHARACTER_TABLE_STORAGE_KEY,
    stepCount: STEP_COUNT,
    lessonState: {
      mismatchSent,
      mismatchReason,
      instructionsAttached,
      scaleChoice,
      sharedTable,
      sharedApplied,
      sharedSent,
      weirdApplied,
      weirdTested,
      agreementRecall,
      agreementCommitted,
      agreementAssessment,
      encodedValues,
      messageSent,
      receiverBroken,
    },
    onRestore: (saved) => {
      setMismatchSent(saved?.mismatchSent === true);
      setMismatchReason(saved?.mismatchReason === "changed" || saved?.mismatchReason === "rules" || saved?.mismatchReason === "binary" ? saved.mismatchReason : null);
      setInstructionsAttached(saved?.instructionsAttached === true);
      setScaleChoice(saved?.scaleChoice === "instructions" || saved?.scaleChoice === "agree" ? saved.scaleChoice : null);
      setSharedTable(isMappingTable(saved?.sharedTable) ? saved.sharedTable : { ...DEFAULT_SHARED_TABLE });
      setSharedApplied(saved?.sharedApplied === true);
      setSharedSent(saved?.sharedSent === true);
      setWeirdApplied(saved?.weirdApplied === true);
      setWeirdTested(saved?.weirdTested === true);
      setAgreementRecall(typeof saved?.agreementRecall === "string" ? saved.agreementRecall : "");
      setAgreementCommitted(saved?.agreementCommitted === true);
      setAgreementAssessment(isAssessment(saved?.agreementAssessment) ? saved.agreementAssessment : null);
      setEncodedValues(isEncodedValues(saved?.encodedValues) ? saved.encodedValues : [null, null, null]);
      setMessageSent(saved?.messageSent === true);
      setReceiverBroken(saved?.receiverBroken === true);
    },
    onReset: () => {
      setMismatchSent(false);
      setMismatchReason(null);
      setInstructionsAttached(false);
      setScaleChoice(null);
      setSharedTable({ ...DEFAULT_SHARED_TABLE });
      setSharedApplied(false);
      setSharedSent(false);
      setWeirdApplied(false);
      setWeirdTested(false);
      setAgreementRecall("");
      setAgreementCommitted(false);
      setAgreementAssessment(null);
      setEncodedValues([null, null, null]);
      setMessageSent(false);
      setReceiverBroken(false);
    },
  });

  function updateSharedValue(symbol: SymbolKey, value: number) {
    setSharedTable((current) => ({ ...current, [symbol]: value }));
    setSharedApplied(false);
    setSharedSent(false);
  }

  function makeWeirdTable() {
    setSharedTable({ ...WEIRD_SHARED_TABLE });
    setWeirdApplied(true);
    setWeirdTested(false);
    setAgreementRecall("");
    setAgreementCommitted(false);
    setAgreementAssessment(null);
    setEncodedValues([null, null, null]);
    setMessageSent(false);
    setReceiverBroken(false);
  }

  if (!progress.hasHydrated) return <main className="app-shell" aria-busy="true" />;

  let screen;
  switch (progress.currentStep) {
    case 0:
      screen = <MismatchStep sent={mismatchSent} onSend={() => { setMismatchSent(true); progress.unlock(1); }} onContinue={() => progress.unlockAndGo(1)} />;
      break;
    case 1:
      screen = (
        <InspectRulesStep
          answer={mismatchReason}
          onAnswer={(answer) => { setMismatchReason(answer); if (answer === "rules") progress.unlock(2); }}
          onContinue={() => progress.unlockAndGo(2)}
        />
      );
      break;
    case 2:
      screen = (
        <ManualFixStep
          attached={instructionsAttached}
          choice={scaleChoice}
          onAttach={() => setInstructionsAttached(true)}
          onChoice={(choice) => { setScaleChoice(choice); if (choice === "agree") progress.unlock(3); }}
          onContinue={() => progress.unlockAndGo(3)}
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
          onSend={() => { setSharedSent(true); progress.unlock(4); }}
          onContinue={() => progress.unlockAndGo(4)}
        />
      );
      break;
    case 4:
      screen = (
        <NumbersMatterStep
          table={sharedTable}
          weirdApplied={weirdApplied}
          tested={weirdTested}
          recallText={agreementRecall}
          recallCommitted={agreementCommitted}
          recallAssessment={agreementAssessment}
          onMakeWeird={makeWeirdTable}
          onTest={() => setWeirdTested(true)}
          onRecallChange={setAgreementRecall}
          onRecallCommit={() => setAgreementCommitted(true)}
          onRecallAssess={(assessment) => { setAgreementAssessment(assessment); progress.unlock(5); }}
          onRecallRewrite={() => { setAgreementCommitted(false); setAgreementAssessment(null); }}
          onContinue={() => progress.unlockAndGo(5)}
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
          onBreakReceiver={() => { setReceiverBroken(true); progress.unlock(6); }}
          onFinish={() => progress.unlockAndGo(6)}
        />
      );
      break;
    default:
      screen = <CompleteStep onRestart={progress.restart} />;
  }

  return (
    <LessonPlayer
      lessonNumber={2}
      lessonSlug="shared-character-table"
      title="Why computers need a shared character table"
      stepLabels={SHARED_CHARACTER_TABLE_STEPS}
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
