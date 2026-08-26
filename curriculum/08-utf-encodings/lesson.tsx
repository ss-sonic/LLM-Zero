"use client";

import { useState } from "react";
import { LessonPlayer } from "../../components/lesson/LessonPlayer";
import type { RecallAssessment } from "../../components/ui/TextRecall";
import { useLessonProgress } from "../../lib/lesson/useLessonProgress";
import { COURSE_CHARACTERS, UTF_ENCODINGS_STEPS, UTF_ENCODINGS_STORAGE_KEY } from "./config";
import { BetLosesStep } from "./steps/BetLoses";
import { BuildRocketAgainStep } from "./steps/BuildRocketAgain";
import { ByteOrderStep } from "./steps/ByteOrder";
import { CompleteStep } from "./steps/Complete";
import { FixedWidthBuysStep } from "./steps/FixedWidthBuys";
import { MakeTheBetStep } from "./steps/MakeTheBet";
import { ThePatchStep } from "./steps/ThePatch";
import { TheCeilingStep } from "./steps/TheCeiling";
import { WhichWouldYouUseStep } from "./steps/WhichWouldYouUse";
import type { BetChoice, ByteOrder, FitMark, UtfEncodingsPersistedState } from "./types";

/**
 * Lesson 08 — UTF-8 vs UTF-16 vs UTF-32.
 *
 * Assessment modes, as `skills.md` §12 requires them to be stated:
 *
 * - Step 1 · Predict — take the 1991 bet. Both options were genuinely reasonable
 *   and both were actually built, so there is no careful-sounding card to spot.
 * - Step 2 · Construct — locate a character by byte under each encoding, and feel
 *   the difference between computing an index and walking to it.
 * - Step 3 · Construct, then break — check the course's own characters against a
 *   16-bit unit. The one that overflows is the one the learner built by hand last
 *   lesson.
 * - Step 4 · Construct — derive how far a reserved pair can reach.
 * - Step 5 · Construct — derive U+10FFFF, the number Lesson 07 deferred.
 * - Step 6 · Recall (Lesson 02) — the same bytes read two ways, and why UTF-8's
 *   one-byte unit is immune.
 * - Step 7 · Construct (mastery) — build the surrogate pair for U+1F680 by hand,
 *   the same character Lesson 07 built in UTF-8.
 * - Step 8 · Construct (completion) — price a CJK string where UTF-16 genuinely
 *   wins, so the lesson cannot collapse into "UTF-8 is best".
 *
 * Deliberately out of scope: normalisation, combining marks and grapheme
 * clusters. They are real and they are a different concept — how many code
 * points make one *perceived* character — and nothing here depends on them.
 */
const STEP_COUNT = UTF_ENCODINGS_STEPS.length;
const FIT_COUNT = COURSE_CHARACTERS.length;

const emptyStrings = (count: number) => Array.from({ length: count }, () => "");
const emptyMarks = (): FitMark[] => Array.from({ length: FIT_COUNT }, () => null);

function safeStrings(value: unknown, count: number) {
  if (!Array.isArray(value) || value.length !== count) return emptyStrings(count);
  return value.map((item) => typeof item === "string" ? item : "");
}

function safeMarks(value: unknown): FitMark[] {
  if (!Array.isArray(value) || value.length !== FIT_COUNT) return emptyMarks();
  return value.map((item) => item === "fits" || item === "too-big" ? item : null);
}

function safeOrders(value: unknown): ByteOrder[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is ByteOrder => item === "big" || item === "little");
}

export function UtfEncodingsLesson() {
  const [betChoice, setBetChoice] = useState<BetChoice>(null);
  const [utf8ByteInput, setUtf8ByteInput] = useState("");
  const [utf32ByteInput, setUtf32ByteInput] = useState("");
  const [fitMarks, setFitMarks] = useState<FitMark[]>(emptyMarks());
  const [pairValuesInput, setPairValuesInput] = useState("");
  const [ceilingInput, setCeilingInput] = useState("");
  const [ordersSeen, setOrdersSeen] = useState<ByteOrder[]>([]);
  const [orderRecall, setOrderRecall] = useState("");
  const [orderCommitted, setOrderCommitted] = useState(false);
  const [orderAssessment, setOrderAssessment] = useState<RecallAssessment>(null);
  const [offsetInput, setOffsetInput] = useState("");
  const [halfBitInputs, setHalfBitInputs] = useState<string[]>(emptyStrings(2));
  const [halfValueInputs, setHalfValueInputs] = useState<string[]>(emptyStrings(2));
  const [cjkUtf8Input, setCjkUtf8Input] = useState("");
  const [cjkUtf16Input, setCjkUtf16Input] = useState("");

  const progress = useLessonProgress<UtfEncodingsPersistedState>({
    storageKey: UTF_ENCODINGS_STORAGE_KEY,
    stepCount: STEP_COUNT,
    lessonState: {
      betChoice, utf8ByteInput, utf32ByteInput, fitMarks, pairValuesInput, ceilingInput,
      ordersSeen, orderRecall, orderCommitted, orderAssessment,
      offsetInput, halfBitInputs, halfValueInputs, cjkUtf8Input, cjkUtf16Input,
    },
    onRestore: (saved) => {
      setBetChoice(saved?.betChoice === "compact" || saved?.betChoice === "roomy" ? saved.betChoice : null);
      setUtf8ByteInput(typeof saved?.utf8ByteInput === "string" ? saved.utf8ByteInput : "");
      setUtf32ByteInput(typeof saved?.utf32ByteInput === "string" ? saved.utf32ByteInput : "");
      setFitMarks(safeMarks(saved?.fitMarks));
      setPairValuesInput(typeof saved?.pairValuesInput === "string" ? saved.pairValuesInput : "");
      setCeilingInput(typeof saved?.ceilingInput === "string" ? saved.ceilingInput : "");
      setOrdersSeen(safeOrders(saved?.ordersSeen));
      setOrderRecall(typeof saved?.orderRecall === "string" ? saved.orderRecall : "");
      setOrderCommitted(saved?.orderCommitted === true);
      setOrderAssessment(saved?.orderAssessment === "matched" || saved?.orderAssessment === "missed" ? saved.orderAssessment : null);
      setOffsetInput(typeof saved?.offsetInput === "string" ? saved.offsetInput : "");
      setHalfBitInputs(safeStrings(saved?.halfBitInputs, 2));
      setHalfValueInputs(safeStrings(saved?.halfValueInputs, 2));
      setCjkUtf8Input(typeof saved?.cjkUtf8Input === "string" ? saved.cjkUtf8Input : "");
      setCjkUtf16Input(typeof saved?.cjkUtf16Input === "string" ? saved.cjkUtf16Input : "");
    },
    onReset: () => {
      setBetChoice(null);
      setUtf8ByteInput("");
      setUtf32ByteInput("");
      setFitMarks(emptyMarks());
      setPairValuesInput("");
      setCeilingInput("");
      setOrdersSeen([]);
      setOrderRecall("");
      setOrderCommitted(false);
      setOrderAssessment(null);
      setOffsetInput("");
      setHalfBitInputs(emptyStrings(2));
      setHalfValueInputs(emptyStrings(2));
      setCjkUtf8Input("");
      setCjkUtf16Input("");
    },
  });

  function updateAt(setter: (updater: (current: string[]) => string[]) => void, index: number, value: string) {
    setter((current) => current.map((item, itemIndex) => itemIndex === index ? value : item));
  }

  if (!progress.hasHydrated) return <main className="app-shell" aria-busy="true" />;

  let screen;
  switch (progress.currentStep) {
    case 0:
      screen = (
        <MakeTheBetStep
          choice={betChoice}
          onChoose={(choice) => { setBetChoice(choice); progress.unlock(1); }}
          onContinue={() => progress.unlockAndGo(1)}
        />
      );
      break;
    case 1:
      screen = (
        <FixedWidthBuysStep
          utf8Value={utf8ByteInput}
          utf32Value={utf32ByteInput}
          onUtf8Change={setUtf8ByteInput}
          onUtf32Change={setUtf32ByteInput}
          onContinue={() => progress.unlockAndGo(2)}
        />
      );
      break;
    case 2:
      screen = (
        <BetLosesStep
          marks={fitMarks}
          onCycleMark={(index) => setFitMarks((current) => current.map((mark, markIndex) => (
            markIndex === index ? (mark === "fits" ? "too-big" : "fits") : mark
          )))}
          onContinue={() => progress.unlockAndGo(3)}
        />
      );
      break;
    case 3:
      screen = (
        <ThePatchStep
          value={pairValuesInput}
          onChange={setPairValuesInput}
          onContinue={() => progress.unlockAndGo(4)}
        />
      );
      break;
    case 4:
      screen = (
        <TheCeilingStep
          value={ceilingInput}
          onChange={setCeilingInput}
          onContinue={() => progress.unlockAndGo(5)}
        />
      );
      break;
    case 5:
      screen = (
        <ByteOrderStep
          seen={ordersSeen}
          recallText={orderRecall}
          recallCommitted={orderCommitted}
          recallAssessment={orderAssessment}
          onTryOrder={(order) => setOrdersSeen((current) => [...current.filter((item) => item !== order), order])}
          onRecallChange={setOrderRecall}
          onRecallCommit={() => setOrderCommitted(true)}
          onRecallAssess={(assessment) => { setOrderAssessment(assessment); progress.unlock(6); }}
          onRecallRewrite={() => { setOrderCommitted(false); setOrderAssessment(null); }}
          onContinue={() => progress.unlockAndGo(6)}
        />
      );
      break;
    case 6:
      screen = (
        <BuildRocketAgainStep
          offsetValue={offsetInput}
          halfBits={halfBitInputs}
          halfValues={halfValueInputs}
          onOffsetChange={setOffsetInput}
          onHalfBitsChange={(index, value) => updateAt(setHalfBitInputs, index, value)}
          onHalfValueChange={(index, value) => updateAt(setHalfValueInputs, index, value)}
          onContinue={() => progress.unlockAndGo(7)}
        />
      );
      break;
    case 7:
      screen = (
        <WhichWouldYouUseStep
          utf8Value={cjkUtf8Input}
          utf16Value={cjkUtf16Input}
          onUtf8Change={setCjkUtf8Input}
          onUtf16Change={setCjkUtf16Input}
          onContinue={() => progress.unlockAndGo(8)}
        />
      );
      break;
    default:
      screen = <CompleteStep onRestart={progress.restart} />;
  }

  return (
    <LessonPlayer
      lessonNumber={8}
      lessonSlug="utf-encodings"
      title="UTF-8 vs UTF-16 vs UTF-32"
      stepLabels={UTF_ENCODINGS_STEPS}
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
