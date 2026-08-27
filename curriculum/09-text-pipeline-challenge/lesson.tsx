"use client";

import { useState } from "react";
import { LessonPlayer } from "../../components/lesson/LessonPlayer";
import type { RecallAssessment } from "../../components/ui/TextRecall";
import { useLessonProgress } from "../../lib/lesson/useLessonProgress";
import { CHALLENGE_STEPS, CHALLENGE_STORAGE_KEY, HAND_BUILD, SENTENCE_CHARACTERS } from "./config";
import { SCRAMBLED_STAGE_IDS } from "./pipeline";
import { BuildByHandStep } from "./steps/BuildByHand";
import { CompleteStep } from "./steps/Complete";
import { DiagnoseTheBreakStep } from "./steps/DiagnoseTheBreak";
import { LayOutPipelineStep } from "./steps/LayOutPipeline";
import { PriceTheSentenceStep } from "./steps/PriceTheSentence";
import { PriceThreeWaysStep } from "./steps/PriceThreeWays";
import { ReadItBackStep } from "./steps/ReadItBack";
import { SymbolsToNumbersStep } from "./steps/SymbolsToNumbers";
import { TheJobStep } from "./steps/TheJob";
import { YourOwnCharacterStep } from "./steps/YourOwnCharacter";
import type { ChallengePersistedState, EncodingGuess } from "./types";

/**
 * The Phase 1 Challenge — trace a multilingual sentence from symbols to bytes.
 *
 * This is not a lesson and does not follow the lesson loop: there is no new idea
 * to introduce, so there is no problem to expose before naming a solution. What
 * it tests is the thing eight lessons structurally could not, because each of
 * them told the learner which link they were working on — composition, the
 * branch between forms, the reverse direction, and diagnosis.
 *
 * Assessment modes, as `skills.md` §13 requires them to be stated:
 *
 * - Step 1 · Predict — wager a byte count before any work, against a sentence
 *   Lesson 07 priced that has the same number of characters and fewer bytes.
 *   Nothing is checked here; step 4 settles it.
 * - Step 2 · Construct (arrange) — put the five pipeline stages in order. This is
 *   the composition check and the reason the rest can proceed unscaffolded.
 * - Step 3 · Construct + Recall (Lessons 03, 05) — a code point per character.
 *   Five follow from ASCII's consecutive runs and Unicode's carry-over; four are
 *   database facts, and knowing which is which is the part that transfers.
 * - Step 4 · Construct (Lesson 07) — a byte width per character with the band
 *   table withheld, then the bill, which resolves step 1's wager.
 * - Step 5 · Construct (mastery) — 你 built byte by byte. Three bytes is the one
 *   UTF-8 form the curriculum derived but never made anyone produce.
 * - Step 6 · Predict, then Construct — price the same sentence under UTF-16 and
 *   UTF-32. Deliberately not another surrogate-pair build: what is new is the
 *   aggregate, that the unit count is not the character count, and that Lesson
 *   08's "UTF-16 wins on CJK" does not survive contact with a mixed sentence.
 * - Step 7 · Construct (reverse) — split and decode an unseen stream. Encoding is
 *   only half a rule.
 * - Step 8 · Construct + Recall (Lesson 02) — diagnose real mojibake where every
 *   byte is correct and the reader guessed.
 * - Step 9 · Construct (completion) — a character the learner chooses, which
 *   nothing on the screen was written for.
 *
 * Deliberately out of scope: tokenization, normalisation and grapheme clusters,
 * and byte order marks. The first belongs to Phase 2; the second two were already
 * excluded by Lesson 08 and nothing here depends on them.
 */
const STEP_COUNT = CHALLENGE_STEPS.length;
const CHARACTER_COUNT = SENTENCE_CHARACTERS.length;
const DIGIT_COUNT = HAND_BUILD.hexDigits.length;
const SLICE_COUNT = HAND_BUILD.payloadSlices.length;

const emptyStrings = (count: number) => Array.from({ length: count }, () => "");

function safeStrings(value: unknown, count: number) {
  if (!Array.isArray(value) || value.length !== count) return emptyStrings(count);
  return value.map((item) => (typeof item === "string" ? item : ""));
}

/** A restored order is only trusted if every entry is a real stage and none repeats. */
function safeStageOrder(value: unknown) {
  if (!Array.isArray(value)) return [];
  const ids = value.filter((item): item is string => typeof item === "string" && SCRAMBLED_STAGE_IDS.includes(item as never));
  return ids.filter((id, index) => ids.indexOf(id) === index);
}

export function TextPipelineChallenge() {
  const [predictedBytes, setPredictedBytes] = useState("");
  const [wagerPlaced, setWagerPlaced] = useState(false);
  const [stageOrder, setStageOrder] = useState<string[]>([]);
  const [codePointInputs, setCodePointInputs] = useState<string[]>(emptyStrings(CHARACTER_COUNT));
  const [databaseOpen, setDatabaseOpen] = useState(false);
  const [widthInputs, setWidthInputs] = useState<string[]>(emptyStrings(CHARACTER_COUNT));
  const [totalInput, setTotalInput] = useState("");
  const [digitBitInputs, setDigitBitInputs] = useState<string[]>(emptyStrings(DIGIT_COUNT));
  const [sliceInputs, setSliceInputs] = useState<string[]>(emptyStrings(SLICE_COUNT));
  const [byteHexInputs, setByteHexInputs] = useState<string[]>(emptyStrings(SLICE_COUNT));
  const [encodingGuess, setEncodingGuess] = useState<EncodingGuess>(null);
  const [unitInput, setUnitInput] = useState("");
  const [utf16BytesInput, setUtf16BytesInput] = useState("");
  const [utf32BytesInput, setUtf32BytesInput] = useState("");
  const [groupCountInput, setGroupCountInput] = useState("");
  const [firstCodePointInput, setFirstCodePointInput] = useState("");
  const [lastCodePointInput, setLastCodePointInput] = useState("");
  const [brokenCountInput, setBrokenCountInput] = useState("");
  const [brokenByteIndex, setBrokenByteIndex] = useState<number | null>(null);
  const [brokenRecall, setBrokenRecall] = useState("");
  const [brokenCommitted, setBrokenCommitted] = useState(false);
  const [brokenAssessment, setBrokenAssessment] = useState<RecallAssessment>(null);
  const [chosenCharacter, setChosenCharacter] = useState("");
  const [chosenLengthInput, setChosenLengthInput] = useState("");
  const [chosenHexInput, setChosenHexInput] = useState("");

  const progress = useLessonProgress<ChallengePersistedState>({
    storageKey: CHALLENGE_STORAGE_KEY,
    stepCount: STEP_COUNT,
    lessonState: {
      predictedBytes, wagerPlaced, stageOrder, codePointInputs, databaseOpen,
      widthInputs, totalInput, digitBitInputs, sliceInputs, byteHexInputs,
      encodingGuess, unitInput, utf16BytesInput, utf32BytesInput,
      groupCountInput, firstCodePointInput, lastCodePointInput,
      brokenCountInput, brokenByteIndex, brokenRecall, brokenCommitted, brokenAssessment,
      chosenCharacter, chosenLengthInput, chosenHexInput,
    },
    onRestore: (saved) => {
      setPredictedBytes(typeof saved?.predictedBytes === "string" ? saved.predictedBytes : "");
      setWagerPlaced(saved?.wagerPlaced === true);
      setStageOrder(safeStageOrder(saved?.stageOrder));
      setCodePointInputs(safeStrings(saved?.codePointInputs, CHARACTER_COUNT));
      setDatabaseOpen(saved?.databaseOpen === true);
      setWidthInputs(safeStrings(saved?.widthInputs, CHARACTER_COUNT));
      setTotalInput(typeof saved?.totalInput === "string" ? saved.totalInput : "");
      setDigitBitInputs(safeStrings(saved?.digitBitInputs, DIGIT_COUNT));
      setSliceInputs(safeStrings(saved?.sliceInputs, SLICE_COUNT));
      setByteHexInputs(safeStrings(saved?.byteHexInputs, SLICE_COUNT));
      setEncodingGuess(saved?.encodingGuess === "utf-8" || saved?.encodingGuess === "utf-16" ? saved.encodingGuess : null);
      setUnitInput(typeof saved?.unitInput === "string" ? saved.unitInput : "");
      setUtf16BytesInput(typeof saved?.utf16BytesInput === "string" ? saved.utf16BytesInput : "");
      setUtf32BytesInput(typeof saved?.utf32BytesInput === "string" ? saved.utf32BytesInput : "");
      setGroupCountInput(typeof saved?.groupCountInput === "string" ? saved.groupCountInput : "");
      setFirstCodePointInput(typeof saved?.firstCodePointInput === "string" ? saved.firstCodePointInput : "");
      setLastCodePointInput(typeof saved?.lastCodePointInput === "string" ? saved.lastCodePointInput : "");
      setBrokenCountInput(typeof saved?.brokenCountInput === "string" ? saved.brokenCountInput : "");
      setBrokenByteIndex(typeof saved?.brokenByteIndex === "number" ? saved.brokenByteIndex : null);
      setBrokenRecall(typeof saved?.brokenRecall === "string" ? saved.brokenRecall : "");
      setBrokenCommitted(saved?.brokenCommitted === true);
      setBrokenAssessment(saved?.brokenAssessment === "matched" || saved?.brokenAssessment === "missed" ? saved.brokenAssessment : null);
      setChosenCharacter(typeof saved?.chosenCharacter === "string" ? saved.chosenCharacter : "");
      setChosenLengthInput(typeof saved?.chosenLengthInput === "string" ? saved.chosenLengthInput : "");
      setChosenHexInput(typeof saved?.chosenHexInput === "string" ? saved.chosenHexInput : "");
    },
    onReset: () => {
      setPredictedBytes("");
      setWagerPlaced(false);
      setStageOrder([]);
      setCodePointInputs(emptyStrings(CHARACTER_COUNT));
      setDatabaseOpen(false);
      setWidthInputs(emptyStrings(CHARACTER_COUNT));
      setTotalInput("");
      setDigitBitInputs(emptyStrings(DIGIT_COUNT));
      setSliceInputs(emptyStrings(SLICE_COUNT));
      setByteHexInputs(emptyStrings(SLICE_COUNT));
      setEncodingGuess(null);
      setUnitInput("");
      setUtf16BytesInput("");
      setUtf32BytesInput("");
      setGroupCountInput("");
      setFirstCodePointInput("");
      setLastCodePointInput("");
      setBrokenCountInput("");
      setBrokenByteIndex(null);
      setBrokenRecall("");
      setBrokenCommitted(false);
      setBrokenAssessment(null);
      setChosenCharacter("");
      setChosenLengthInput("");
      setChosenHexInput("");
    },
  });

  function updateAt(setter: (updater: (current: string[]) => string[]) => void, index: number, value: string) {
    setter((current) => current.map((item, itemIndex) => (itemIndex === index ? value : item)));
  }

  if (!progress.hasHydrated) return <main className="app-shell" aria-busy="true" />;

  let screen;
  switch (progress.currentStep) {
    case 0:
      screen = (
        <TheJobStep
          value={predictedBytes}
          placed={wagerPlaced}
          onChange={setPredictedBytes}
          onPlace={() => { setWagerPlaced(true); progress.unlock(1); }}
          onContinue={() => progress.unlockAndGo(1)}
        />
      );
      break;
    case 1:
      screen = (
        <LayOutPipelineStep
          order={stageOrder}
          onPlace={(id) => setStageOrder((current) => (current.includes(id) ? current : [...current, id]))}
          onRemove={(id) => setStageOrder((current) => current.filter((item) => item !== id))}
          onClear={() => setStageOrder([])}
          onContinue={() => progress.unlockAndGo(2)}
        />
      );
      break;
    case 2:
      screen = (
        <SymbolsToNumbersStep
          values={codePointInputs}
          databaseOpen={databaseOpen}
          onChange={(index, value) => updateAt(setCodePointInputs, index, value)}
          onOpenDatabase={() => setDatabaseOpen(true)}
          onContinue={() => progress.unlockAndGo(3)}
        />
      );
      break;
    case 3:
      screen = (
        <PriceTheSentenceStep
          widths={widthInputs}
          total={totalInput}
          wager={predictedBytes}
          onWidthChange={(index, value) => updateAt(setWidthInputs, index, value)}
          onTotalChange={setTotalInput}
          onContinue={() => progress.unlockAndGo(4)}
        />
      );
      break;
    case 4:
      screen = (
        <BuildByHandStep
          digitBits={digitBitInputs}
          slices={sliceInputs}
          byteHex={byteHexInputs}
          onDigitBitsChange={(index, value) => updateAt(setDigitBitInputs, index, value)}
          onSliceChange={(index, value) => updateAt(setSliceInputs, index, value)}
          onByteHexChange={(index, value) => updateAt(setByteHexInputs, index, value)}
          onContinue={() => progress.unlockAndGo(5)}
        />
      );
      break;
    case 5:
      screen = (
        <PriceThreeWaysStep
          guess={encodingGuess}
          units={unitInput}
          utf16Bytes={utf16BytesInput}
          utf32Bytes={utf32BytesInput}
          onGuess={setEncodingGuess}
          onUnitsChange={setUnitInput}
          onUtf16Change={setUtf16BytesInput}
          onUtf32Change={setUtf32BytesInput}
          onContinue={() => progress.unlockAndGo(6)}
        />
      );
      break;
    case 6:
      screen = (
        <ReadItBackStep
          groupCount={groupCountInput}
          firstCodePoint={firstCodePointInput}
          lastCodePoint={lastCodePointInput}
          onGroupCountChange={setGroupCountInput}
          onFirstChange={setFirstCodePointInput}
          onLastChange={setLastCodePointInput}
          onContinue={() => progress.unlockAndGo(7)}
        />
      );
      break;
    case 7:
      screen = (
        <DiagnoseTheBreakStep
          countValue={brokenCountInput}
          selectedByte={brokenByteIndex}
          recallText={brokenRecall}
          committed={brokenCommitted}
          assessment={brokenAssessment}
          onCountChange={setBrokenCountInput}
          onSelectByte={setBrokenByteIndex}
          onRecallChange={setBrokenRecall}
          onCommit={() => setBrokenCommitted(true)}
          onAssess={(assessment) => { setBrokenAssessment(assessment); progress.unlock(8); }}
          onRewrite={() => { setBrokenCommitted(false); setBrokenAssessment(null); }}
          onContinue={() => progress.unlockAndGo(8)}
        />
      );
      break;
    case 8:
      screen = (
        <YourOwnCharacterStep
          chosen={chosenCharacter}
          lengthValue={chosenLengthInput}
          hexValue={chosenHexInput}
          onChoose={setChosenCharacter}
          onLengthChange={setChosenLengthInput}
          onHexChange={setChosenHexInput}
          onContinue={() => progress.unlockAndGo(9)}
        />
      );
      break;
    default:
      screen = <CompleteStep onRestart={progress.restart} />;
  }

  return (
    <LessonPlayer
      kicker="Challenge"
      lessonSlug="text-pipeline-challenge"
      title="Trace a sentence to bytes"
      stepLabels={CHALLENGE_STEPS}
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
