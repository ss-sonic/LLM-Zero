"use client";

import { Feedback } from "../../../components/ui/Feedback";
import { QuestionPrompt } from "../../../components/ui/QuestionPrompt";
import { BYTE_PLACE_VALUES, bitsToNumber } from "../../../lib/lesson/binary";
import { ROCKET } from "../config";
import { BYTE_MAX } from "../encoding";

export function ByteLimitStep({
  bits,
  patternCountInput,
  onToggleBit,
  onPatternCountChange,
  onContinue,
}: {
  bits: string[];
  patternCountInput: string;
  onToggleBit: (index: number) => void;
  onPatternCountChange: (value: string) => void;
  onContinue: () => void;
}) {
  const value = bitsToNumber(bits);
  const atMaximum = value === BYTE_MAX;
  const countAttempted = patternCountInput.trim() !== "";
  const countCorrect = Number(patternCountInput) === 256;

  return (
    <div className="screen-layout centered-screen wide-screen l6-screen">
      <QuestionPrompt
        eyebrow="Step 2 · Rebuild an old idea"
        title="How much room does one byte actually give us?"
        lead="Eight bits are already familiar. Rebuild the largest byte value instead of accepting a number from us."
      />

      <div className="card l6-byte-lab">
        <div className="l6-bit-row" aria-label={`Current byte ${bits.join("")}, numeric value ${value}`}>
          {bits.map((bit, index) => (
            <label className="l6-bit-position" key={BYTE_PLACE_VALUES[index]}>
              <small>{BYTE_PLACE_VALUES[index]}</small>
              <button
                className={bit === "1" ? "l6-bit on" : "l6-bit"}
                onClick={() => onToggleBit(index)}
                aria-label={`Bit worth ${BYTE_PLACE_VALUES[index]}, currently ${bit}`}
              >
                {bit}
              </button>
            </label>
          ))}
        </div>
        <div className="l6-byte-value"><code>{bits.join("")}</code><span>=</span><strong>{value}</strong></div>
        {!atMaximum ? <p className="quiet-copy">Turn on every position. You are looking for the ceiling, not a random byte.</p> : null}
      </div>

      {atMaximum ? (
        <div className="l6-followup card">
          <div>
            <small>largest value</small>
            <strong>{BYTE_MAX}</strong>
          </div>
          <div className="l6-followup-question">
            <h3>How many different values are there from 0 through 255?</h3>
            <input
              type="number"
              min={0}
              value={patternCountInput}
              onChange={(event) => onPatternCountChange(event.target.value)}
              aria-label="Number of distinct values a byte can represent"
              placeholder="?"
            />
          </div>
        </div>
      ) : null}

      {atMaximum && countAttempted && !countCorrect ? (
        <Feedback tone="nudge">255 is the largest value, but zero counts too. Count the whole range from 0 through 255.</Feedback>
      ) : null}

      {atMaximum && countCorrect ? (
        <>
          <Feedback tone="success"><b>256 possible byte values: 0 through 255.</b></Feedback>
          <div className="l6-size-compare">
            <div><small>one byte</small><strong>0–255</strong></div>
            <span>vs</span>
            <div className="too-large"><small>{ROCKET.symbol} code point</small><strong>{ROCKET.decimal.toLocaleString("en-US")}</strong></div>
          </div>
          <p className="quiet-copy l6-centered-note">The computer can represent {ROCKET.decimal.toLocaleString("en-US")}. It simply cannot fit that value into <strong>one</strong> byte.</p>
          <button className="primary-button l6-main-action" onClick={onContinue}>Give the number more room →</button>
        </>
      ) : null}
    </div>
  );
}
