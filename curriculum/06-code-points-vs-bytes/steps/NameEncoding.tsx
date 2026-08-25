"use client";

import { QuestionPrompt } from "../../../components/ui/QuestionPrompt";
import { ROCKET } from "../config";

export function NameEncodingStep({
  revealed,
  onReveal,
  onContinue,
}: {
  revealed: boolean;
  onReveal: () => void;
  onContinue: () => void;
}) {
  return (
    <div className="screen-layout centered-screen wide-screen l6-screen">
      <QuestionPrompt
        eyebrow="Step 6 · Name the missing idea"
        title="We need an agreed rule between code points and concrete storage."
        lead="You already invented such a rule and watched communication fail when two machines disagreed about it. Now the idea has earned its name."
      />

      {!revealed ? <button className="primary-button l6-main-action" onClick={onReveal}>Reveal the name →</button> : (
        <>
          <div className="card l6-term-card">
            <small>new term</small>
            <strong>encoding</strong>
            <p>An agreed rule that tells us how an identity is represented in concrete units and how to recover the identity again.</p>
            <span>For this lesson, our concrete units are bytes.</span>
          </div>

          <div className="l6-layer-pipeline" aria-label="Character through code point, encoding, bytes and bits">
            <div><small>character</small><strong>{ROCKET.symbol}</strong></div>
            <span><b>Unicode</b>→</span>
            <div><small>code point</small><code>{ROCKET.notation}</code></div>
            <span><b>encoding</b>→</span>
            <div><small>bytes</small><strong>1 · 246 · 128</strong></div>
            <span><b>binary</b>→</span>
            <div><small>bits</small><code>00000001 11110110 10000000</code></div>
          </div>

          <div className="l6-rule-contrast">
            <div><small>agreement</small><b>{ROCKET.symbol} → {ROCKET.notation}</b><span>Unicode assigns the identity.</span></div>
            <div><small>agreement</small><b>{ROCKET.notation} → bytes</b><span>The encoding chooses a representation.</span></div>
            <div><small>mathematics</small><b>byte value → 8 bits</b><span>Once the byte value is fixed, binary positional notation determines its bit pattern.</span></div>
          </div>

          <details className="l6-side-note">
            <summary>Does Unicode use more precise vocabulary than this?</summary>
            <p>Yes. Real Unicode specifications distinguish concepts such as code units, encoding forms, and encoding schemes. We are keeping one conceptual arrow here until those distinctions solve a problem the learner has actually encountered.</p>
          </details>

          <button className="primary-button l6-main-action" onClick={onContinue}>Use the encoding in both directions →</button>
        </>
      )}
    </div>
  );
}
