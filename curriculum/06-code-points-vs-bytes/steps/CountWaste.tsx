"use client";

import { Feedback } from "../../../components/ui/Feedback";
import { QuestionPrompt } from "../../../components/ui/QuestionPrompt";
import { COST_TEXT, TOY_WIDTH } from "../config";
import { encodeFixedWidth } from "../encoding";

const CHARACTERS = Array.from(COST_TEXT);
const ENCODED = CHARACTERS.map((character) => ({
  character,
  codePoint: character.codePointAt(0) ?? 0,
  bytes: encodeFixedWidth(character.codePointAt(0) ?? 0, TOY_WIDTH) ?? [],
}));
const TOTAL_BYTES = ENCODED.flatMap((entry) => entry.bytes).length;
const ZERO_BYTES = ENCODED.flatMap((entry) => entry.bytes).filter((byte) => byte === 0).length;

export function CountWasteStep({
  totalInput,
  zeroInput,
  onTotalChange,
  onZeroChange,
  onFinish,
}: {
  totalInput: string;
  zeroInput: string;
  onTotalChange: (value: string) => void;
  onZeroChange: (value: string) => void;
  onFinish: () => void;
}) {
  const totalCorrect = Number(totalInput) === TOTAL_BYTES;
  const zeroCorrect = Number(zeroInput) === ZERO_BYTES;
  const totalAttempted = totalInput.trim() !== "";
  const zeroAttempted = zeroInput.trim() !== "";

  return (
    <div className="screen-layout centered-screen wide-screen l6-screen">
      <QuestionPrompt
        eyebrow="Step 8 · Make the next problem visible"
        title={<>Our rule can store 🚀. What does it cost for ordinary “{COST_TEXT}”?</>}
        lead="Every character receives three byte positions, even when its code point is tiny. Count the consequence yourself."
      />

      <div className="card l6-cost-lab">
        {ENCODED.map((entry) => (
          <div className="l6-cost-character" key={entry.character}>
            <strong>{entry.character}</strong>
            <small>code point {entry.codePoint}</small>
            <div>{entry.bytes.map((byte, index) => <code className={byte === 0 ? "padding" : ""} key={index}>{byte}</code>)}</div>
          </div>
        ))}
      </div>

      <div className="l6-cost-questions">
        <label><span>Total bytes used</span><input type="number" min={0} value={totalInput} onChange={(event) => onTotalChange(event.target.value)} /></label>
        <label><span>How many are zero padding?</span><input type="number" min={0} value={zeroInput} onChange={(event) => onZeroChange(event.target.value)} /></label>
      </div>

      {totalAttempted && !totalCorrect ? <Feedback tone="nudge">Three characters × three byte positions each.</Feedback> : null}
      {totalCorrect && zeroAttempted && !zeroCorrect ? <Feedback tone="nudge">Look at the six dashed byte boxes. They carry no value for these small code points.</Feedback> : null}

      {totalCorrect && zeroCorrect ? (
        <>
          <Feedback tone="success"><div><b>{TOTAL_BYTES} bytes total; {ZERO_BYTES} of them are zeros.</b><span>Our simple rule buys enough room for large code points by spending the same room on every small one.</span></div></Feedback>
          <div className="card l6-next-problem">
            <small>next engineering problem</small>
            <h3>Can an encoding use fewer bytes for small values and more bytes only when a character needs them?</h3>
            <p>Do not answer yet. That question is the reason the next real encoding is worth learning.</p>
          </div>
          <button className="primary-button l6-main-action" onClick={onFinish}>Complete Lesson 06 →</button>
        </>
      ) : null}
    </div>
  );
}
