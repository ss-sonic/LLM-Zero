"use client";

import { Feedback } from "../../../components/ui/Feedback";
import { QuestionPrompt } from "../../../components/ui/QuestionPrompt";
import { NIBBLE_WEIGHTS } from "../config";
import { bitsToValue } from "../hex";

export function FourBitsStep({ bits, patternCount, onToggle, onPatternCount, onContinue }: { bits: string[]; patternCount: string; onToggle: (index: number) => void; onPatternCount: (value: string) => void; onContinue: () => void }) {
  const value = bitsToValue(bits);
  const maxed = value === 15;
  const solved = maxed && Number(patternCount) === 16;
  return (
    <div className="screen-layout centered-screen wide-screen hx-screen">
      <QuestionPrompt eyebrow="Step 2 · Shrink the problem" title="How many patterns can four bits make?" lead="Turn every position on to find the largest value. Then count from zero instead of confusing the largest value with the number of possibilities." />
      <div className="hx-nibble-lab card">
        <div className="hx-bit-grid">
          {bits.map((bit, index) => (
            <div className="hx-bit-cell" key={NIBBLE_WEIGHTS[index]}>
              <small>{NIBBLE_WEIGHTS[index]}</small>
              <button className={bit === "1" ? "on" : ""} onClick={() => onToggle(index)} aria-label={`Bit worth ${NIBBLE_WEIGHTS[index]}, currently ${bit}`}>{bit}</button>
            </div>
          ))}
        </div>
        <div className="hx-live-value"><code>{bits.join("")}</code><span>=</span><strong>{value}</strong></div>
      </div>
      {maxed ? (
        <div className="hx-answer-card card">
          <h3>Largest value: 15. How many values are there from 0 through 15?</h3>
          <input type="number" min={0} value={patternCount} onChange={(event) => onPatternCount(event.target.value)} aria-label="Number of patterns four bits can make" />
          {patternCount && !solved ? <Feedback tone="nudge">Include zero. The values are 0, 1, 2, …, 15.</Feedback> : null}
        </div>
      ) : null}
      {solved ? (
        <>
          <Feedback tone="success"><div><b>Four bits give exactly 16 patterns.</b><span>That is small enough that one human-readable symbol can stand for each pattern.</span></div></Feedback>
          <button className="primary-button hx-main-action" onClick={onContinue}>We need 16 symbols →</button>
        </>
      ) : null}
    </div>
  );
}
