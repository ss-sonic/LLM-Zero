"use client";

import { Feedback } from "../../../components/ui/Feedback";
import { QuestionPrompt } from "../../../components/ui/QuestionPrompt";
import { BILL_CHARACTERS, BILL_TEXT, BILL_TOTAL_BYTES, BILL_ZERO_BYTES } from "../config";

export function TheBillStep({
  value,
  onChange,
  onContinue,
}: {
  value: string;
  onChange: (value: string) => void;
  onContinue: () => void;
}) {
  const touched = value.trim() !== "";
  const solved = Number(value) === BILL_ZERO_BYTES;

  return (
    <div className="screen-layout centered-screen wide-screen l7-screen">
      <QuestionPrompt
        eyebrow="Step 1 · The bill"
        title="How much of this message is actually the message?"
        lead={<>Your Lesson 06 rule gives every character the same three byte positions. Here is what that costs <span className="inline-token">{BILL_TEXT}</span> — {BILL_CHARACTERS.length} characters, {BILL_TOTAL_BYTES} bytes.</>}
      />

      <div className="card l7-bill">
        <div className="l7-bill-grid" aria-label={`Every byte of ${BILL_TEXT} under the fixed-width rule`}>
          {BILL_CHARACTERS.map((entry, index) => (
            <div className="l7-bill-column" key={`${entry.character}-${index}`}>
              <strong>{entry.label}</strong>
              <small>{entry.codePoint}</small>
              {entry.fixedBytes.map((byte, byteIndex) => (
                <code className={byte === 0 ? "empty" : ""} key={byteIndex}>{byte}</code>
              ))}
            </div>
          ))}
        </div>

        <div className="l7-bill-question">
          <label htmlFor="zero-count">How many of those {BILL_TOTAL_BYTES} bytes carry nothing at all?</label>
          <input
            id="zero-count"
            className={`l7-input${solved ? " right" : ""}${touched && !solved ? " wrong" : ""}`}
            type="number"
            min={0}
            max={BILL_TOTAL_BYTES}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="?"
          />
        </div>

        {touched && !solved && (
          <Feedback tone="nudge">
            Count the zeros in the grid. Any character whose number is under 256 leaves its first two positions empty.
          </Feedback>
        )}
      </div>

      {solved && (
        <>
          <Feedback tone="success">
            <div>
              <b>{BILL_ZERO_BYTES} of {BILL_TOTAL_BYTES} bytes are zero.</b>
              <span>Most of this message is padding. Every character is paying for the space 🚀 needs, whether it needs it or not.</span>
            </div>
          </Feedback>
          <button className="primary-button l7-main-action" onClick={onContinue}>Let small numbers be small →</button>
        </>
      )}
    </div>
  );
}
