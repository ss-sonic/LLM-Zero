"use client";

import { QuestionPrompt } from "../../../components/ui/QuestionPrompt";

const interpretations = [
  { id: "one-one-one", groups: ["72", "195", "169"] },
  { id: "one-two", groups: ["72", "195 169"] },
  { id: "two-one", groups: ["72 195", "169"] },
] as const;

export function BoundaryStep({ seen, onInspect, onContinue }: { seen: string[]; onInspect: (id: string) => void; onContinue: () => void }) {
  const ready = new Set(seen).size >= 2;
  return (
    <div className="screen-layout centered-screen wide-screen u8-screen">
      <QuestionPrompt eyebrow="Step 2 · A new problem appears" title="If character widths vary, where does one character end?" lead="Pretend these three bytes arrived with no other rule. Try more than one possible grouping." />
      <div className="u8-stream card"><small>bytes on the wire</small><div><code>72</code><code>195</code><code>169</code></div></div>
      <div className="u8-grouping-grid">
        {interpretations.map((item) => (
          <button key={item.id} className={seen.includes(item.id) ? "seen" : ""} onClick={() => onInspect(item.id)}>
            {item.groups.map((group) => <code key={group}>[{group}]</code>)}
          </button>
        ))}
      </div>
      {ready ? (
        <div className="u8-discovery">
          <b>Variable length saves space, but raw bytes need structure.</b>
          <span>The receiver needs a reliable way to know which byte starts a character and how many bytes belong to it.</span>
        </div>
      ) : <p className="quiet-copy">Try at least two groupings. The point is not to guess the right one — it is to notice that the bytes alone have not told us.</p>}
      {ready ? <button className="primary-button u8-main-action" onClick={onContinue}>Can the bytes label themselves? →</button> : null}
    </div>
  );
}
