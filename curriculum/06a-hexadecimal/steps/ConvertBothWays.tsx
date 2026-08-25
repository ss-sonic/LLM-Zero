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
      <QuestionPrompt eyebrow="Step 6 · Both directions" title="Can you move between bits and hex without changing the value?" lead="Do one byte in each direction. Work four bits at a time." />
      <div className="hx-two-exercises">
        <div className="card hx-exercise">
          <small>binary → hex</small><h3>{FORWARD_BINARY.slice(0,4)} {FORWARD_BINARY.slice(4)}</h3>
          <div className="hx-inline-inputs">{[0,1].map((index) => <input key={index} maxLength={1} value={forwardHex[index]} onChange={(event) => onForwardChange(index, event.target.value)} placeholder="?" aria-label={`Hex digit ${index + 1} for ${FORWARD_BINARY}`} />)}</div>
          {forwardDone ? <strong className="hx-inline-result">= F6</strong> : null}
        </div>
        <div className="card hx-exercise">
          <small>hex → binary</small><h3>{REVERSE_HEX}</h3>
          <div className="hx-inline-inputs bits">{[0,1].map((index) => <input key={index} maxLength={4} value={reverseBits[index]} onChange={(event) => onReverseChange(index, event.target.value.replace(/[^01]/g, ""))} placeholder="????" aria-label={`Four bits for hex digit ${REVERSE_HEX[index]}`} />)}</div>
          {reverseDone ? <strong className="hx-inline-result">= 10011010</strong> : null}
        </div>
      </div>
      {solved ? (
        <>
          <Feedback tone="success"><div><b>You converted both ways without doing anything to the stored value.</b><span>Every hex digit simply names one exact four-bit pattern.</span></div></Feedback>
          <button className="primary-button hx-main-action" onClick={onContinue}>Return to the ugly sequence →</button>
        </>
      ) : null}
    </div>
  );
}
