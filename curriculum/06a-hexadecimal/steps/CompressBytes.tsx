"use client";

import { Feedback } from "../../../components/ui/Feedback";
import { QuestionPrompt } from "../../../components/ui/QuestionPrompt";
import { COMPRESSION_BITS, COMPRESSION_HEX } from "../config";
import { normalizeHex } from "../hex";

export function CompressBytesStep({ values, onChange, onContinue }: { values: string[]; onChange: (index: number, value: string) => void; onContinue: () => void }) {
  const solved = values.every((item, index) => normalizeHex(item) === COMPRESSION_HEX[index]);
  return (
    <div className="screen-layout centered-screen wide-screen hx-screen">
      <QuestionPrompt eyebrow="Step 7 · Compress the notation" title="Rewrite these four bytes without losing a single bit." lead="This is the sequence that was annoying to compare at the start. Give each four-bit half its hex digit." />
      <div className="hx-compress card">
        {COMPRESSION_BITS.map((byte, index) => (
          <div className="hx-compress-row" key={byte}>
            <code>{byte.slice(0,4)} {byte.slice(4)}</code><span>→</span>
            <input maxLength={2} value={values[index]} onChange={(event) => onChange(index, event.target.value)} placeholder="??" aria-label={`Hexadecimal for byte ${byte}`} />
          </div>
        ))}
      </div>
      {solved ? (
        <>
          <Feedback tone="success"><div><b>F0 9F 9A 80</b><span>Thirty-two written bits became eight hex digits. Nothing about the underlying values changed.</span></div></Feedback>
          <div className="hx-final-contrast card"><div><small>binary notation</small><code>11110000 10011111 10011010 10000000</code></div><span>same values</span><div><small>hex notation</small><code>F0 9F 9A 80</code></div></div>
          <button className="primary-button hx-main-action" onClick={onContinue}>Finish the bridge →</button>
        </>
      ) : null}
    </div>
  );
}
