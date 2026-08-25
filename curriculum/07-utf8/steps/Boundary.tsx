"use client";

import { useState } from "react";
import { QuestionPrompt } from "../../../components/ui/QuestionPrompt";

const interpretations = [
  { id: "one-one-one", groups: ["72", "195", "169"] },
  { id: "one-two", groups: ["72", "195 169"] },
  { id: "two-one", groups: ["72 195", "169"] },
] as const;

export function BoundaryStep({ seen, onInspect, onContinue }: { seen: string[]; onInspect: (id: string) => void; onContinue: () => void }) {
  const [active, setActive] = useState<string | null>(() => seen.at(-1) ?? null);
  const ready = new Set(seen).size >= 2;

  function choose(id: string) {
    if (active === id) {
      setActive(null);
      return;
    }
    setActive(id);
    onInspect(id);
  }

  return (
    <div className="screen-layout centered-screen wide-screen u8-screen">
      <QuestionPrompt
        eyebrow="Step 2 · A new problem appears"
        title="If character widths vary, where does one character end?"
        lead="Pretend these three bytes arrived with no other rule. Choose one possible grouping, then switch to another."
      />
      <div className="u8-stream card">
        <small>bytes on the wire</small>
        <div><code>72</code><code>195</code><code>169</code></div>
      </div>
      <div className="u8-grouping-grid" role="group" aria-label="Possible ways to group the same three bytes">
        {interpretations.map((item) => {
          const selected = active === item.id;
          const explored = seen.includes(item.id);
          return (
            <button
              key={item.id}
              className={selected ? "seen" : ""}
              aria-pressed={selected}
              onClick={() => choose(item.id)}
            >
              {item.groups.map((group) => <code key={group}>[{group}]</code>)}
              {explored && !selected ? <small>✓ tried</small> : selected ? <small>current interpretation</small> : null}
            </button>
          );
        })}
      </div>
      {ready ? (
        <div className="u8-discovery">
          <b>Two different groupings both looked possible from the raw bytes alone.</b>
          <span>Variable length saves space, but the receiver needs a reliable rule for where a character starts and how many bytes belong to it.</span>
        </div>
      ) : (
        <p className="quiet-copy">Pick one interpretation first. Then replace it with a different one. The point is not to guess the right grouping — it is to discover that the raw bytes have not told us.</p>
      )}
      {ready ? <button className="primary-button u8-main-action" onClick={onContinue}>Can the bytes label themselves? →</button> : null}
    </div>
  );
}
