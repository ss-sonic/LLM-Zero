"use client";

import { Feedback } from "../../../components/ui/Feedback";
import { QuestionPrompt } from "../../../components/ui/QuestionPrompt";

export function WasteStep({ value, onChange, onContinue }: { value: string; onChange: (value: string) => void; onContinue: () => void }) {
  const solved = Number(value) === 9;
  return (
    <div className="screen-layout centered-screen wide-screen u8-screen">
      <QuestionPrompt eyebrow="Step 1 · Retrieve Lesson 06" title="Why should A pay for bytes it does not need?" lead="Our toy rule used exactly three bytes for every code point. Reconstruct the cost before we try to improve it." />
      <div className="u8-cost-compare">
        <div className="card"><small>A · code point 65</small><div className="u8-byte-row"><code>0</code><code>0</code><code>65</code></div><span>3 bytes</span></div>
        <div className="card"><small>🚀 · code point 128640</small><div className="u8-byte-row"><code>1</code><code>246</code><code>128</code></div><span>3 bytes</span></div>
      </div>
      <div className="u8-question-card card">
        <label htmlFor="u8-waste">CAT has 3 characters. With 3 bytes per character, how many bytes does our toy rule spend?</label>
        <div><input id="u8-waste" type="number" min={0} value={value} onChange={(event) => onChange(event.target.value)} /><span>bytes</span></div>
      </div>
      {value && !solved ? <Feedback tone="nudge">Three characters × three bytes each.</Feedback> : null}
      {solved ? <Feedback tone="success"><div><b>9 bytes — even though C, A, and T are tiny values.</b><span>A fixed width solves storage, but it spends the same space on every code point.</span></div></Feedback> : null}
      {solved ? <button className="primary-button u8-main-action" onClick={onContinue}>Let the width change →</button> : null}
    </div>
  );
}
