"use client";

import Link from "next/link";
import { ROCKET } from "../config";

export function CompleteStep({ onRestart }: { onRestart: () => void }) {
  return (
    <div className="screen-layout complete-screen l6-complete-screen">
      <div className="completion-mark">✓</div>
      <p className="eyebrow">Lesson 06 complete</p>
      <h2>A code point is an identity. Bytes are a representation chosen by an encoding.</h2>
      <p className="lead completion-lead">You built a byte representation yourself, changed the rule without changing the character, broke communication by disagreeing about the rule, and then recovered the identity by decoding the bytes.</p>

      <div className="l6-final-model" aria-label="Character to code point to encoding to bytes">
        <div><small>character</small><strong>{ROCKET.symbol}</strong></div>
        <span>→</span>
        <div><small>Unicode code point</small><code>{ROCKET.notation}</code></div>
        <span>→</span>
        <div><small>encoding</small><strong>agreed rule</strong></div>
        <span>→</span>
        <div><small>bytes</small><strong>concrete values</strong></div>
        <span>→</span>
        <div><small>bits</small><strong>binary form</strong></div>
      </div>

      <div className="l6-solved-open">
        <div><small>now understood</small><b>Why U+1F680 does not uniquely tell us the bytes in memory.</b></div>
        <div><small>new problem</small><b>How can a real encoding stay compact for small values while still representing large code points?</b></div>
      </div>

      <div className="next-lesson-card">
        <div>
          <small>Before the next lesson</small>
          <h3>One tiny foundation bridge: hexadecimal.</h3>
          <p>It is only a compact way to read groups of binary bits. Once that notation is earned, we can build a real variable-length Unicode encoding byte by byte.</p>
        </div>
        <span className="locked-pill">🔒 Foundation · Binary ↔ hexadecimal</span>
      </div>

      <div className="l6-complete-actions">
        <Link href="/" className="primary-button">Back to course map</Link>
        <button className="text-link-button" onClick={onRestart}>Replay this lesson</button>
      </div>
    </div>
  );
}
