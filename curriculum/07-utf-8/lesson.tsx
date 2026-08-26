"use client";

import { useState } from "react";
import { LessonPlayer } from "../../components/lesson/LessonPlayer";
import type { RecallAssessment } from "../../components/ui/TextRecall";
import { useLessonProgress } from "../../lib/lesson/useLessonProgress";
import {
  AMBIGUOUS_BYTES,
  ROCKET,
  SIZE_EXAMPLES,
  STREAM_BYTES,
  UTF_8_STEPS,
  UTF_8_STORAGE_KEY,
} from "./config";
import { BuildRocketStep } from "./steps/BuildRocket";
import { CompleteStep } from "./steps/Complete";
import { CountRoomStep } from "./steps/CountRoom";
import { FreeBitStep } from "./steps/FreeBit";
import { ReadStreamStep } from "./steps/ReadStream";
import { SmallNumbersStep } from "./steps/SmallNumbers";
import { SplitStreamStep } from "./steps/SplitStream";
import { TagBytesStep } from "./steps/TagBytes";
import { TheBillStep } from "./steps/TheBill";
import type { ByteLabel, Utf8PersistedState } from "./types";

/**
 * Lesson 07 — Build UTF-8 by hand.
 *
 * Assessment modes, as `skills.md` §12 requires them to be stated:
 *
 * - Step 1 · Construct — count the dead bytes in the fixed-width bill.
 * - Step 2 · Construct — size each character under a variable-length rule.
 * - Step 3 · Predict, then break — commit to one reading of a byte stream and
 *   watch an equally legal one appear beside it. This is the screen the lesson
 *   turns on: the problem is discovered, never announced.
 * - Step 4 · Recall (Lesson 03) + Construct — produce ASCII's ceiling, which is
 *   the only reason UTF-8's first tag costs nothing, then commit to the bit that
 *   must open a multi-byte byte.
 * - Step 5 · Construct — write the lead tags, with the forced parts of the design
 *   separated from the chosen one.
 * - Step 6 · Construct — count the bits the tags leave behind.
 * - Step 7 · Construct (mastery) — turn U+1F680 into four real bytes using the
 *   hexadecimal bridge, landing on the bytes that bridge opened with.
 * - Step 8 · Construct (completion) + Recall — split a real stream using nothing
 *   but the tags, then say why that is always possible.
 *
 * Deliberately out of scope: UTF-16, UTF-32, surrogates and byte order, all of
 * which belong to Lesson 08. Step 6 meets Unicode's U+10FFFF ceiling and says
 * plainly that the reason lives in the next lesson rather than inventing one.
 */
const STEP_COUNT = UTF_8_STEPS.length;
const SIZE_COUNT = SIZE_EXAMPLES.length;
const CUT_COUNT = AMBIGUOUS_BYTES.length - 1;
const TAG_COUNT = 3;
const ROOM_COUNT = 4;
const DIGIT_COUNT = ROCKET.hexDigits.length;
const PAYLOAD_COUNT = ROCKET.payloadSlices.length;

const emptyStrings = (count: number) => Array.from({ length: count }, () => "");
const emptyCuts = () => Array.from({ length: CUT_COUNT }, () => false);
const emptyLabels = (): ByteLabel[] => Array.from({ length: STREAM_BYTES.length }, () => null);

function safeStrings(value: unknown, count: number) {
  if (!Array.isArray(value) || value.length !== count) return emptyStrings(count);
  return value.map((item) => typeof item === "string" ? item : "");
}

function safeCuts(value: unknown) {
  if (!Array.isArray(value) || value.length !== CUT_COUNT) return emptyCuts();
  return value.map((item) => item === true);
}

function safeLabels(value: unknown): ByteLabel[] {
  if (!Array.isArray(value) || value.length !== STREAM_BYTES.length) return emptyLabels();
  return value.map((item) => item === "start" || item === "continuation" ? item : null);
}

function safeAssessment(value: unknown): RecallAssessment {
  return value === "matched" || value === "missed" ? value : null;
}

export function Utf8Lesson() {
  const [zeroCountInput, setZeroCountInput] = useState("");
  const [sizeInputs, setSizeInputs] = useState<string[]>(emptyStrings(SIZE_COUNT));
  const [streamSplits, setStreamSplits] = useState<boolean[]>(emptyCuts());
  const [streamCommitted, setStreamCommitted] = useState(false);
  const [asciiMaxInput, setAsciiMaxInput] = useState("");
  const [leadBit, setLeadBit] = useState("");
  const [tagInputs, setTagInputs] = useState<string[]>(emptyStrings(TAG_COUNT));
  const [roomInputs, setRoomInputs] = useState<string[]>(emptyStrings(ROOM_COUNT));
  const [formInput, setFormInput] = useState("");
  const [digitBitInputs, setDigitBitInputs] = useState<string[]>(emptyStrings(DIGIT_COUNT));
  const [payloadInputs, setPayloadInputs] = useState<string[]>(emptyStrings(PAYLOAD_COUNT));
  const [byteLabels, setByteLabels] = useState<ByteLabel[]>(emptyLabels());
  const [resyncSeen, setResyncSeen] = useState(false);
  const [closingRecall, setClosingRecall] = useState("");
  const [closingCommitted, setClosingCommitted] = useState(false);
  const [closingAssessment, setClosingAssessment] = useState<RecallAssessment>(null);

  const progress = useLessonProgress<Utf8PersistedState>({
    storageKey: UTF_8_STORAGE_KEY,
    stepCount: STEP_COUNT,
    lessonState: {
      zeroCountInput, sizeInputs, streamSplits, streamCommitted, asciiMaxInput, leadBit,
      tagInputs, roomInputs, formInput, digitBitInputs, payloadInputs, byteLabels, resyncSeen,
      closingRecall, closingCommitted, closingAssessment,
    },
    onRestore: (saved) => {
      setZeroCountInput(typeof saved?.zeroCountInput === "string" ? saved.zeroCountInput : "");
      setSizeInputs(safeStrings(saved?.sizeInputs, SIZE_COUNT));
      setStreamSplits(safeCuts(saved?.streamSplits));
      setStreamCommitted(saved?.streamCommitted === true);
      setAsciiMaxInput(typeof saved?.asciiMaxInput === "string" ? saved.asciiMaxInput : "");
      setLeadBit(saved?.leadBit === "1" || saved?.leadBit === "0" ? saved.leadBit : "");
      setTagInputs(safeStrings(saved?.tagInputs, TAG_COUNT));
      setRoomInputs(safeStrings(saved?.roomInputs, ROOM_COUNT));
      setFormInput(typeof saved?.formInput === "string" ? saved.formInput : "");
      setDigitBitInputs(safeStrings(saved?.digitBitInputs, DIGIT_COUNT));
      setPayloadInputs(safeStrings(saved?.payloadInputs, PAYLOAD_COUNT));
      setByteLabels(safeLabels(saved?.byteLabels));
      setResyncSeen(saved?.resyncSeen === true);
      setClosingRecall(typeof saved?.closingRecall === "string" ? saved.closingRecall : "");
      setClosingCommitted(saved?.closingCommitted === true);
      setClosingAssessment(safeAssessment(saved?.closingAssessment));
    },
    onReset: () => {
      setZeroCountInput("");
      setSizeInputs(emptyStrings(SIZE_COUNT));
      setStreamSplits(emptyCuts());
      setStreamCommitted(false);
      setAsciiMaxInput("");
      setLeadBit("");
      setTagInputs(emptyStrings(TAG_COUNT));
      setRoomInputs(emptyStrings(ROOM_COUNT));
      setFormInput("");
      setDigitBitInputs(emptyStrings(DIGIT_COUNT));
      setPayloadInputs(emptyStrings(PAYLOAD_COUNT));
      setByteLabels(emptyLabels());
      setResyncSeen(false);
      setClosingRecall("");
      setClosingCommitted(false);
      setClosingAssessment(null);
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
        <TheBillStep
          value={zeroCountInput}
          onChange={setZeroCountInput}
          onContinue={() => progress.unlockAndGo(1)}
        />
      );
      break;
    case 1:
      screen = (
        <SmallNumbersStep
          values={sizeInputs}
          onChange={(index, value) => updateAt(setSizeInputs, index, value)}
          onContinue={() => progress.unlockAndGo(2)}
        />
      );
      break;
    case 2:
      screen = (
        <ReadStreamStep
          splits={streamSplits}
          committed={streamCommitted}
          onToggleSplit={(index) => setStreamSplits((current) => current.map((cut, cutIndex) => cutIndex === index ? !cut : cut))}
          onCommit={() => { setStreamCommitted(true); progress.unlock(3); }}
          onContinue={() => progress.unlockAndGo(3)}
        />
      );
      break;
    case 3:
      screen = (
        <FreeBitStep
          asciiMaxInput={asciiMaxInput}
          leadBit={leadBit}
          onAsciiMaxChange={setAsciiMaxInput}
          onLeadBitToggle={() => setLeadBit((current) => current === "0" ? "1" : "0")}
          onContinue={() => progress.unlockAndGo(4)}
        />
      );
      break;
    case 4:
      screen = (
        <TagBytesStep
          values={tagInputs}
          onChange={(index, value) => updateAt(setTagInputs, index, value)}
          onContinue={() => progress.unlockAndGo(5)}
        />
      );
      break;
    case 5:
      screen = (
        <CountRoomStep
          values={roomInputs}
          onChange={(index, value) => updateAt(setRoomInputs, index, value)}
          onContinue={() => progress.unlockAndGo(6)}
        />
      );
      break;
    case 6:
      screen = (
        <BuildRocketStep
          formInput={formInput}
          digitBits={digitBitInputs}
          payloads={payloadInputs}
          onFormChange={setFormInput}
          onDigitBitsChange={(index, value) => updateAt(setDigitBitInputs, index, value)}
          onPayloadChange={(index, value) => updateAt(setPayloadInputs, index, value)}
          onContinue={() => progress.unlockAndGo(7)}
        />
      );
      break;
    case 7:
      screen = (
        <SplitStreamStep
          labels={byteLabels}
          resyncSeen={resyncSeen}
          recallText={closingRecall}
          recallCommitted={closingCommitted}
          recallAssessment={closingAssessment}
          onCycleLabel={(index) => setByteLabels((current) => current.map((label, labelIndex) => (
            labelIndex === index ? (label === "start" ? "continuation" : "start") : label
          )))}
          onShowResync={() => setResyncSeen(true)}
          onRecallChange={setClosingRecall}
          onRecallCommit={() => setClosingCommitted(true)}
          onRecallAssess={(assessment) => { setClosingAssessment(assessment); progress.unlock(8); }}
          onRecallRewrite={() => { setClosingCommitted(false); setClosingAssessment(null); }}
          onContinue={() => progress.unlockAndGo(8)}
        />
      );
      break;
    default:
      screen = <CompleteStep onRestart={progress.restart} />;
  }

  return (
    <LessonPlayer
      lessonNumber={7}
      lessonSlug="utf-8"
      title="Build UTF-8 by hand"
      stepLabels={UTF_8_STEPS}
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
