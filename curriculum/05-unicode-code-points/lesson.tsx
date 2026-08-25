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
  INVENTED_DEFAULT_TABLE,
  INVENTED_SYMBOLS,
  UNICODE_CODE_POINT_STEPS,
  UNICODE_CODE_POINT_STORAGE_KEY,
  UNICODE_EXAMPLES,
} from "./config";
import { CompleteStep } from "./steps/Complete";
import { GlobalIdentityChallengeStep } from "./steps/GlobalIdentityChallenge";
import { IdentityStorageStep } from "./steps/IdentityStorage";
import { InventIdentitiesStep } from "./steps/InventIdentities";
import { MeetUnicodeStep } from "./steps/MeetUnicode";
import { NameIdeaStep } from "./steps/NameIdea";
import { ReadNotationStep } from "./steps/ReadNotation";
import { WorldSystemStep } from "./steps/WorldSystem";
import type {
  ChallengeMatches,
  CodePointAnswer,
  FinalConceptAnswer,
  InventedSymbol,
  InventedTable,
  RequirementAnswer,
  StorageAnswer,
  UnicodeCodePointPersistedState,
} from "./types";

const STEP_COUNT = UNICODE_CODE_POINT_STEPS.length;
const CHALLENGE_LENGTH = UNICODE_EXAMPLES.length;

function isInventedTable(value: unknown): value is InventedTable {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<InventedTable>;
  return INVENTED_SYMBOLS.every((symbol) => typeof candidate[symbol] === "number" && Number.isFinite(candidate[symbol]));
}

function safeSeenIds(value: unknown) {
  if (!Array.isArray(value)) return [UNICODE_EXAMPLES[0].id];
  const allowed = UNICODE_EXAMPLES.map((example) => example.id);
  const filtered = value.filter((item): item is string => typeof item === "string" && allowed.includes(item));
  return filtered.length ? Array.from(new Set(filtered)) : [UNICODE_EXAMPLES[0].id];
}

function safeSelectedId(value: unknown) {
  return typeof value === "string" && UNICODE_EXAMPLES.some((example) => example.id === value)
    ? value
    : UNICODE_EXAMPLES[0].id;
}

function safeChallengeMatches(value: unknown): ChallengeMatches {
  if (!Array.isArray(value) || value.length !== CHALLENGE_LENGTH) {
    return Array.from({ length: CHALLENGE_LENGTH }, () => null);
  }
  return value.map((item) => typeof item === "string" ? item : null);
}

export function UnicodeCodePointLesson() {
  const [hasHydrated, setHasHydrated] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [highestUnlocked, setHighestUnlocked] = useState(0);
  const [requirementAnswer, setRequirementAnswer] = useState<RequirementAnswer>(null);
  const [inventedTable, setInventedTable] = useState<InventedTable>({ ...INVENTED_DEFAULT_TABLE });
  const [tablePublished, setTablePublished] = useState(false);
  const [tableSent, setTableSent] = useState(false);
  const [codePointAnswer, setCodePointAnswer] = useState<CodePointAnswer>(null);
  const [unicodeRevealed, setUnicodeRevealed] = useState(false);
  const [notationSeenIds, setNotationSeenIds] = useState<string[]>([UNICODE_EXAMPLES[0].id]);
  const [notationSelectedId, setNotationSelectedId] = useState(UNICODE_EXAMPLES[0].id);
  const [storageAnswer, setStorageAnswer] = useState<StorageAnswer>(null);
  const [challengeMatches, setChallengeMatches] = useState<ChallengeMatches>(Array.from({ length: CHALLENGE_LENGTH }, () => null));
  const [finalConceptAnswer, setFinalConceptAnswer] = useState<FinalConceptAnswer>(null);

  useEffect(() => {
    const saved = readPersistedLessonState<UnicodeCodePointPersistedState>(UNICODE_CODE_POINT_STORAGE_KEY);
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
    setRequirementAnswer(saved?.requirementAnswer === "local" || saved?.requirementAnswer === "shared" || saved?.requirementAnswer === "reuse" ? saved.requirementAnswer : null);
    setInventedTable(isInventedTable(saved?.inventedTable) ? saved.inventedTable : { ...INVENTED_DEFAULT_TABLE });
    setTablePublished(saved?.tablePublished === true);
    setTableSent(saved?.tableSent === true);
    setCodePointAnswer(saved?.codePointAnswer === "bytes" || saved?.codePointAnswer === "position" || saved?.codePointAnswer === "picture" ? saved.codePointAnswer : null);
    setUnicodeRevealed(saved?.unicodeRevealed === true);
    setNotationSeenIds(safeSeenIds(saved?.notationSeenIds));
    setNotationSelectedId(safeSelectedId(saved?.notationSelectedId));
    setStorageAnswer(saved?.storageAnswer === "stored" || saved?.storageAnswer === "identity" ? saved.storageAnswer : null);
    setChallengeMatches(safeChallengeMatches(saved?.challengeMatches));
    setFinalConceptAnswer(saved?.finalConceptAnswer === "bytes" || saved?.finalConceptAnswer === "identity" || saved?.finalConceptAnswer === "size" ? saved.finalConceptAnswer : null);
    writeStepToUrl(restoredCurrent, "replace");
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;
    const state: UnicodeCodePointPersistedState = {
      currentStep,
      highestUnlocked,
      requirementAnswer,
      inventedTable,
      tablePublished,
      tableSent,
      codePointAnswer,
      unicodeRevealed,
      notationSeenIds,
      notationSelectedId,
      storageAnswer,
      challengeMatches,
      finalConceptAnswer,
    };
    writePersistedLessonState(UNICODE_CODE_POINT_STORAGE_KEY, state);
  }, [hasHydrated, currentStep, highestUnlocked, requirementAnswer, inventedTable, tablePublished, tableSent, codePointAnswer, unicodeRevealed, notationSeenIds, notationSelectedId, storageAnswer, challengeMatches, finalConceptAnswer]);

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

  function updateInventedValue(symbol: InventedSymbol, value: number) {
    setInventedTable((current) => ({ ...current, [symbol]: value }));
    setTablePublished(false);
    setTableSent(false);
  }

  function selectNotation(id: string) {
    setNotationSelectedId(id);
    setNotationSeenIds((current) => current.includes(id) ? current : [...current, id]);
  }

  function restartLesson() {
    setCurrentStep(0);
    setHighestUnlocked(0);
    setRequirementAnswer(null);
    setInventedTable({ ...INVENTED_DEFAULT_TABLE });
    setTablePublished(false);
    setTableSent(false);
    setCodePointAnswer(null);
    setUnicodeRevealed(false);
    setNotationSeenIds([UNICODE_EXAMPLES[0].id]);
    setNotationSelectedId(UNICODE_EXAMPLES[0].id);
    setStorageAnswer(null);
    setChallengeMatches(Array.from({ length: CHALLENGE_LENGTH }, () => null));
    setFinalConceptAnswer(null);
    clearPersistedLessonState(UNICODE_CODE_POINT_STORAGE_KEY);
    if (hasHydrated) writeStepToUrl(0, "replace");
  }

  if (!hasHydrated) return <main className="app-shell" aria-busy="true" />;

  let screen;
  switch (currentStep) {
    case 0:
      screen = (
        <WorldSystemStep
          answer={requirementAnswer}
          onAnswer={(answer) => { setRequirementAnswer(answer); if (answer === "shared") unlock(1); }}
          onContinue={() => unlockAndGo(1)}
        />
      );
      break;
    case 1:
      screen = (
        <InventIdentitiesStep
          table={inventedTable}
          published={tablePublished}
          sent={tableSent}
          onChange={updateInventedValue}
          onPublish={() => { setTablePublished(true); setTableSent(false); }}
          onSend={() => setTableSent(true)}
          onContinue={() => unlockAndGo(2)}
        />
      );
      break;
    case 2:
      screen = (
        <NameIdeaStep
          answer={codePointAnswer}
          onAnswer={(answer) => { setCodePointAnswer(answer); if (answer === "position") unlock(3); }}
          onContinue={() => unlockAndGo(3)}
        />
      );
      break;
    case 3:
      screen = <MeetUnicodeStep revealed={unicodeRevealed} onReveal={() => setUnicodeRevealed(true)} onContinue={() => unlockAndGo(4)} />;
      break;
    case 4:
      screen = <ReadNotationStep selectedId={notationSelectedId} seenIds={notationSeenIds} onSelect={selectNotation} onContinue={() => unlockAndGo(5)} />;
      break;
    case 5:
      screen = (
        <IdentityStorageStep
          answer={storageAnswer}
          onAnswer={(answer) => { setStorageAnswer(answer); if (answer === "identity") unlock(6); }}
          onContinue={() => unlockAndGo(6)}
        />
      );
      break;
    case 6:
      screen = (
        <GlobalIdentityChallengeStep
          matches={challengeMatches}
          finalAnswer={finalConceptAnswer}
          onMatch={(index, value) => setChallengeMatches((current) => current.map((item, itemIndex) => itemIndex === index ? value : item))}
          onFinalAnswer={(answer) => { setFinalConceptAnswer(answer); if (answer === "identity") unlock(7); }}
          onFinish={() => unlockAndGo(7)}
        />
      );
      break;
    default:
      screen = <CompleteStep onRestart={restartLesson} />;
  }

  return (
    <LessonPlayer
      lessonNumber={5}
      title="Unicode and code points: identity before storage"
      stepLabels={UNICODE_CODE_POINT_STEPS}
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
