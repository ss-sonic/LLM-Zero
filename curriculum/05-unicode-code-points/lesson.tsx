"use client";

import { useState } from "react";
import { LessonPlayer } from "../../components/lesson/LessonPlayer";
import type { RecallAssessment } from "../../components/ui/TextRecall";
import { useLessonProgress } from "../../lib/lesson/useLessonProgress";
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
  CodePointAnswer,
  InventedSymbol,
  InventedTable,
  RequirementAnswer,
  StorageAnswer,
  UnicodeCodePointPersistedState,
} from "./types";

const STEP_COUNT = UNICODE_CODE_POINT_STEPS.length;

function isInventedTable(value: unknown): value is InventedTable {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<InventedTable>;
  return INVENTED_SYMBOLS.every((symbol) => typeof candidate[symbol] === "number" && Number.isFinite(candidate[symbol]));
}

function safeSeenIds(value: unknown) {
  if (!Array.isArray(value)) return [UNICODE_EXAMPLES[0].id];
  const allowed: readonly string[] = UNICODE_EXAMPLES.map((example) => example.id);
  const filtered = value.filter((item): item is string => typeof item === "string" && allowed.includes(item));
  return filtered.length ? Array.from(new Set(filtered)) : [UNICODE_EXAMPLES[0].id];
}

function safeSelectedId(value: unknown) {
  return typeof value === "string" && UNICODE_EXAMPLES.some((example) => example.id === value)
    ? value
    : UNICODE_EXAMPLES[0].id;
}

export function UnicodeCodePointLesson() {
  const [requirementAnswer, setRequirementAnswer] = useState<RequirementAnswer>(null);
  const [inventedTable, setInventedTable] = useState<InventedTable>({ ...INVENTED_DEFAULT_TABLE });
  const [tablePublished, setTablePublished] = useState(false);
  const [tableSent, setTableSent] = useState(false);
  const [codePointAnswer, setCodePointAnswer] = useState<CodePointAnswer>(null);
  const [unicodeRevealed, setUnicodeRevealed] = useState(false);
  const [notationSeenIds, setNotationSeenIds] = useState<string[]>([UNICODE_EXAMPLES[0].id]);
  const [notationSelectedId, setNotationSelectedId] = useState<string>(UNICODE_EXAMPLES[0].id);
  const [storageAnswer, setStorageAnswer] = useState<StorageAnswer>(null);
  const [asciiCodePointInput, setAsciiCodePointInput] = useState("");
  const [identityRecall, setIdentityRecall] = useState("");
  const [identityCommitted, setIdentityCommitted] = useState(false);
  const [identityAssessment, setIdentityAssessment] = useState<RecallAssessment>(null);

  const progress = useLessonProgress<UnicodeCodePointPersistedState>({
    storageKey: UNICODE_CODE_POINT_STORAGE_KEY,
    stepCount: STEP_COUNT,
    lessonState: {
      requirementAnswer,
      inventedTable,
      tablePublished,
      tableSent,
      codePointAnswer,
      unicodeRevealed,
      notationSeenIds,
      notationSelectedId,
      storageAnswer,
      asciiCodePointInput,
      identityRecall,
      identityCommitted,
      identityAssessment,
    },
    onRestore: (saved) => {
      setRequirementAnswer(saved?.requirementAnswer === "local" || saved?.requirementAnswer === "shared" || saved?.requirementAnswer === "reuse" ? saved.requirementAnswer : null);
      setInventedTable(isInventedTable(saved?.inventedTable) ? saved.inventedTable : { ...INVENTED_DEFAULT_TABLE });
      setTablePublished(saved?.tablePublished === true);
      setTableSent(saved?.tableSent === true);
      setCodePointAnswer(saved?.codePointAnswer === "bytes" || saved?.codePointAnswer === "position" || saved?.codePointAnswer === "picture" ? saved.codePointAnswer : null);
      setUnicodeRevealed(saved?.unicodeRevealed === true);
      setNotationSeenIds(safeSeenIds(saved?.notationSeenIds));
      setNotationSelectedId(safeSelectedId(saved?.notationSelectedId));
      setStorageAnswer(saved?.storageAnswer === "stored" || saved?.storageAnswer === "identity" ? saved.storageAnswer : null);

      // Learners who already finished the old match-and-choose check keep their
      // progress rather than being sent back through a screen they completed.
      const clearedLegacyCheck = saved?.finalConceptAnswer === "identity";
      setAsciiCodePointInput(
        typeof saved?.asciiCodePointInput === "string"
          ? saved.asciiCodePointInput
          : clearedLegacyCheck ? "65" : "",
      );
      setIdentityRecall(typeof saved?.identityRecall === "string" ? saved.identityRecall : "");
      setIdentityCommitted(saved?.identityCommitted === true || clearedLegacyCheck);
      setIdentityAssessment(
        saved?.identityAssessment === "matched" || saved?.identityAssessment === "missed"
          ? saved.identityAssessment
          : clearedLegacyCheck ? "matched" : null,
      );
    },
    onReset: () => {
      setRequirementAnswer(null);
      setInventedTable({ ...INVENTED_DEFAULT_TABLE });
      setTablePublished(false);
      setTableSent(false);
      setCodePointAnswer(null);
      setUnicodeRevealed(false);
      setNotationSeenIds([UNICODE_EXAMPLES[0].id]);
      setNotationSelectedId(UNICODE_EXAMPLES[0].id);
      setStorageAnswer(null);
      setAsciiCodePointInput("");
      setIdentityRecall("");
      setIdentityCommitted(false);
      setIdentityAssessment(null);
    },
  });

  function updateInventedValue(symbol: InventedSymbol, value: number) {
    setInventedTable((current) => ({ ...current, [symbol]: value }));
    setTablePublished(false);
    setTableSent(false);
  }

  function selectNotation(id: string) {
    setNotationSelectedId(id);
    setNotationSeenIds((current) => current.includes(id) ? current : [...current, id]);
  }

  if (!progress.hasHydrated) return <main className="app-shell" aria-busy="true" />;

  let screen;
  switch (progress.currentStep) {
    case 0:
      screen = (
        <WorldSystemStep
          answer={requirementAnswer}
          onAnswer={(answer) => { setRequirementAnswer(answer); if (answer === "shared") progress.unlock(1); }}
          onContinue={() => progress.unlockAndGo(1)}
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
          onContinue={() => progress.unlockAndGo(2)}
        />
      );
      break;
    case 2:
      screen = (
        <NameIdeaStep
          answer={codePointAnswer}
          onAnswer={(answer) => { setCodePointAnswer(answer); if (answer === "position") progress.unlock(3); }}
          onContinue={() => progress.unlockAndGo(3)}
        />
      );
      break;
    case 3:
      screen = <MeetUnicodeStep revealed={unicodeRevealed} onReveal={() => setUnicodeRevealed(true)} onContinue={() => progress.unlockAndGo(4)} />;
      break;
    case 4:
      screen = <ReadNotationStep selectedId={notationSelectedId} seenIds={notationSeenIds} onSelect={selectNotation} onContinue={() => progress.unlockAndGo(5)} />;
      break;
    case 5:
      screen = (
        <IdentityStorageStep
          answer={storageAnswer}
          onAnswer={(answer) => { setStorageAnswer(answer); if (answer === "identity") progress.unlock(6); }}
          onContinue={() => progress.unlockAndGo(6)}
        />
      );
      break;
    case 6:
      screen = (
        <GlobalIdentityChallengeStep
          asciiInput={asciiCodePointInput}
          recallText={identityRecall}
          recallCommitted={identityCommitted}
          recallAssessment={identityAssessment}
          onAsciiInputChange={setAsciiCodePointInput}
          onRecallChange={setIdentityRecall}
          onRecallCommit={() => setIdentityCommitted(true)}
          onRecallAssess={(assessment) => { setIdentityAssessment(assessment); progress.unlock(7); }}
          onRecallRewrite={() => { setIdentityCommitted(false); setIdentityAssessment(null); }}
          onFinish={() => progress.unlockAndGo(7)}
        />
      );
      break;
    default:
      screen = <CompleteStep onRestart={progress.restart} />;
  }

  return (
    <LessonPlayer
      lessonNumber={5}
      lessonSlug="unicode"
      title="Unicode and code points: identity before storage"
      stepLabels={UNICODE_CODE_POINT_STEPS}
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
