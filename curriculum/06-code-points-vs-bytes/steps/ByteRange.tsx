"use client";

import { Feedback } from "../../../components/ui/Feedback";
import { QuestionPrompt } from "../../../components/ui/QuestionPrompt";
import { BYTE_PLACE_VALUES, bitsToNumber } from "../../../lib/lesson/binary";
import { ROCKET } from "../config";
import { BYTE_MAX, BYTE_PATTERNS } from "../encoding";

export function ByteRangeStep({
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
  const maxReached = value === BYTE_MAX;
  const countAnswered = patternCountInput.trim() !== "" && Number(patternCountInput) === BYTE_PATTERNS;
  const countAttempted = patternCountInput.trim() !== "";

  return (
    <div className="screen-layout centered-screen wide-screen l6-screen">
      <QuestionPrompt
        eyebrow="Step 2 · Rebuild the byte"
        title="How large a number can a single byte hold?"
        lead="You built these eight positions back in Lesson 01. Turn every one of them on and read the total off yourself."
      />

      <div className="l6-byte-lab card">
        <div className="l6-bits" aria-label={`Byte value ${bits.join("")}, total ${value}`}>
          {bits.map((bit, index) => (
            <div className="l6-bit-cell" key={index}>
              <small aria-hidden="true">{BYTE_PLACE_VALUES[index]}</small>
              <button
                className={bit === "1" ? "l6-bit on" : "l6-bit"}
                onClick={() => onToggleBit(index)}
                aria-label={`Position worth ${BYTE_PLACE_VALUES[index]}, currently ${bit}`}
              >
                {bit}
              </button>
            </div>
          ))}
        </div>
        <div className="l6-byte-total" aria-live="polite">
          <code>{bits.join("")}</code><b>=</b><strong>{value}</strong>
        </div>
        {!maxReached ? (
          <p className="l6-hint">Turn on every position to find the largest value this byte can reach.</p>
        ) : null}
      </div>

      {maxReached ? (
        <>
          <Feedback tone="success">
            <div>
              <b>The largest value one byte holds is {BYTE_MAX}.</b>
              <span>Every position is on, so nothing more can be added without a ninth position.</span>
            </div>
          </Feedback>

          <div className="l6-derive card">
            <h3 className="l6-decision-question">So how many different values can one byte represent?</h3>
            <p className="quiet-copy">Careful: {BYTE_MAX} is the largest value, not the count. Zero is a pattern too.</p>
            <label className="l6-derive-input">
              <span>Number of different values</span>
              <input
                type="number"
                min={0}
                value={patternCountInput}
                onChange={(event) => onPatternCountChange(event.target.value)}
                aria-label="How many different values one byte can represent"
              />
            </label>
            {countAttempted && !countAnswered ? (
              <Feedback tone="nudge">Count the values from 0 up to {BYTE_MAX}, including 0 itself.</Feedback>
            ) : null}
          </div>
        </>
      ) : null}

      {countAnswered ? (
        <>
          <Feedback tone="success">
            <div>
              <b>{BYTE_PATTERNS} values: 0 through {BYTE_MAX}.</b>
              <span>That is the whole range one byte offers.</span>
            </div>
          </Feedback>

          <div className="l6-compare" aria-label="One byte compared with the rocket code point">
            <div><small>One byte reaches</small><strong>0 → {BYTE_MAX}</strong></div>
            <span>vs</span>
            <div className="overflowing"><small>{ROCKET.symbol} needs</small><strong>{ROCKET.codePoint.toLocaleString("en-US")}</strong></div>
          </div>

          <div className="l6-precise card">
            <small>Be precise about the problem</small>
            <p>
              A computer has no trouble representing {ROCKET.codePoint.toLocaleString("en-US")}. The difficulty is narrower than that:
              the value does not fit in <strong>one byte</strong>.
            </p>
          </div>

          <button className="primary-button l6-main-action" onClick={onContinue}>Then spend more bytes →</button>
        </>
      ) : null}
    </div>
  );
}
