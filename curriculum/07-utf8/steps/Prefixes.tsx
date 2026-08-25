"use client";

import { Feedback } from "../../../components/ui/Feedback";
import { QuestionPrompt } from "../../../components/ui/QuestionPrompt";
import { UTF8_PATTERNS } from "../config";

export function PrefixesStep({ seen, onInspect, onContinue }: { seen: number[]; onInspect: (width: number) => void; onContinue: () => void }) {
  const ready = new Set(seen).size === UTF8_PATTERNS.length;
  return (
    <div className="screen-layout centered-screen wide-screen u8-screen">
      <QuestionPrompt eyebrow="Step 3 · Let the bytes carry structure" title="What if the leading bits tell the decoder how long the sequence is?" lead="Inspect each pattern. The fixed leading bits are structure; the x positions are payload bits from the code point." />
      <div className="u8-pattern-grid">
        {UTF8_PATTERNS.map((pattern) => (
          <button className={seen.includes(pattern.width) ? "seen" : ""} key={pattern.width} onClick={() => onInspect(pattern.width)}>
            <small>{pattern.width} byte{pattern.width > 1 ? "s" : ""}</small>
            <div>{pattern.template.map((byte, index) => <code key={`${pattern.width}-${index}`}>{byte}</code>)}</div>
            <span>{pattern.payloadBits} payload bits</span>
          </button>
        ))}
      </div>
      {ready ? <Feedback tone="success"><div><b>This is the core shape of UTF-8.</b><span>One-byte values start with 0. Multi-byte leaders announce the sequence length, and every continuation byte starts with 10.</span></div></Feedback> : <p className="quiet-copy">Open all four widths. Notice that longer sequences spend more leading bits on structure.</p>}
      {ready ? <button className="primary-button u8-main-action" onClick={onContinue}>Use the 1-byte form on A →</button> : null}
    </div>
  );
}
