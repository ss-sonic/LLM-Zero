"use client";

import { Feedback } from "../../../components/ui/Feedback";
import { QuestionPrompt } from "../../../components/ui/QuestionPrompt";
import { FORWARD_BINARY, FORWARD_HEX, REVERSE_BITS, REVERSE_HEX } from "../config";
import { normalizeHex } from "../hex";

export function ConvertBothWaysStep({ forwardHex, reverseBits, onForwardChange, onReverseChange, onContinue }: { forwardHex: string[]; reverseBits: string[]; onForwardChange: (index: number, value: string) => void; onReverseChange: (index: number, value: string) => void; onContinue: () => void }) {
  const forwardDone = forwardHex.every((item, index) => normalizeHex(item) === FORWARD_HEX[index]);
  const reverseDone = reverseBits.every((item, index) => item.trim() === REVERSE_BITS[index]);
  const solved = forwardDone && reverseDone;

  return (
    <div className="screen-layout centered-screen wide-screen hx-screen">
      <QuestionPrompt
        eyebrow="Step 6 · One value, both directions"
        title="Can you shorten one byte to hex — then reconstruct the exact same bits?"
        lead="Keep the value fixed. First rename each four-bit group with one hex digit. Then take that exact hex result and reverse it."
      />

      <div className="hx-two-exercises">
        <div className="card hx-exercise">
          <small>binary → hex</small>
          <h3>{FORWARD_BINARY.slice(0, 4)} {FORWARD_BINARY.slice(4)}</h3>
          <div className="hx-inline-inputs">
            {[0, 1].map((index) => (
              <input
                key={index}
                maxLength={1}
                value={forwardHex[index]}
                onChange={(event) => onForwardChange(index, event.target.value)}
                placeholder="?"
                aria-label={`Hex digit ${index + 1} for ${FORWARD_BINARY}`}
              />
            ))}
          </div>
          {forwardDone ? <strong className="hx-inline-result">{FORWARD_BINARY} → {REVERSE_HEX}</strong> : null}
        </div>

        <div className={forwardDone ? "card hx-exercise" : "card hx-exercise locked-exercise"}>
          <small>hex → binary</small>
          <h3>Now reverse the exact result: {REVERSE_HEX}</h3>
          <div className="hx-inline-inputs bits">
            {[0, 1].map((index) => (
              <input
                key={index}
                maxLength={4}
                value={reverseBits[index]}
                onChange={(event) => onReverseChange(index, event.target.value.replace(/[^01]/g, ""))}
                placeholder="????"
                disabled={!forwardDone}
                aria-label={`Four bits for hex digit ${REVERSE_HEX[index]}`}
              />
            ))}
          </div>
          {reverseDone ? <strong className="hx-inline-result">{REVERSE_HEX} → {REVERSE_BITS.join("")}</strong> : null}
        </div>
      </div>

      {solved ? (
        <>
          <Feedback tone="success">
            <div>
              <b>{FORWARD_BINARY} ↔ {REVERSE_HEX}</b>
              <span>You went forward and backward without changing the underlying value. Hex only changed how the same bits were written.</span>
            </div>
          </Feedback>
          <button className="primary-button hx-main-action" onClick={onContinue}>Return to the ugly sequence →</button>
        </>
      ) : null}
    </div>
  );
}
