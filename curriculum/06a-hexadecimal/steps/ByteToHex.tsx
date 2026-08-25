"use client";

import { Feedback } from "../../../components/ui/Feedback";
import { QuestionPrompt } from "../../../components/ui/QuestionPrompt";
import { A_BYTE_BITS, A_BYTE_HEX, A_CODE_POINT_DECIMAL } from "../config";
import { normalizeHex } from "../hex";

export function ByteToHexStep({ hexValues, decimalValue, onHexChange, onDecimalChange, onContinue }: { hexValues: string[]; decimalValue: string; onHexChange: (index: number, value: string) => void; onDecimalChange: (value: string) => void; onContinue: () => void }) {
  const hexDone = hexValues.every((item, index) => normalizeHex(item) === A_BYTE_HEX[index]);
  const decimalDone = Number(decimalValue) === A_CODE_POINT_DECIMAL;
  const solved = hexDone && decimalDone;
  return (
    <div className="screen-layout centered-screen wide-screen hx-screen">
      <QuestionPrompt eyebrow="Step 5 · One byte, two hex digits" title="Turn 01000001 into hexadecimal." lead="Split the byte into two groups of four. Each group already has a one-symbol name." />
      <div className="hx-byte-card card">
        <div className="hx-byte-bits"><code>{A_BYTE_BITS.slice(0, 4)}</code><span>|</span><code>{A_BYTE_BITS.slice(4)}</code></div>
        <div className="hx-byte-inputs">
          {[0, 1].map((index) => <input key={index} maxLength={1} value={hexValues[index]} onChange={(event) => onHexChange(index, event.target.value)} aria-label={`Hex digit ${index + 1}`} placeholder="?" />)}
        </div>
        <div className="hx-byte-equation"><span>hex</span><strong>{hexDone ? "41" : "??"}</strong></div>
      </div>
      {hexDone ? (
        <div className="hx-answer-card card">
          <h3>In base 16, the two positions are worth 16 and 1. What is 41₁₆ in decimal?</h3>
          <div className="hx-positional-hint"><code>4 × 16</code><span>+</span><code>1 × 1</code><span>=</span></div>
          <input type="number" min={0} value={decimalValue} onChange={(event) => onDecimalChange(event.target.value)} aria-label="Decimal value of hexadecimal 41" />
        </div>
      ) : null}
      {solved ? (
        <>
          <Feedback tone="success"><div><b>01000001₂ = 41₁₆ = 65₁₀.</b><span>Three notations, one numeric value.</span></div></Feedback>
          <div className="hx-uplus card"><strong>A</strong><span>→</span><code>U+0041</code><span>= code point</span><b>65 decimal</b></div>
          <p className="quiet-copy hx-caveat">This retrieves Lesson 05: the “0041” in U+0041 is hexadecimal notation. It does not mean decimal 41. And writing 41 in hex is still notation — it is not an encoding decision.</p>
          <button className="primary-button hx-main-action" onClick={onContinue}>Convert in both directions →</button>
        </>
      ) : null}
    </div>
  );
}
