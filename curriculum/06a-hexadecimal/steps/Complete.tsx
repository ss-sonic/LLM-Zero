"use client";

import Link from "next/link";

export function CompleteStep({ onRestart }: { onRestart: () => void }) {
  return (
    <div className="screen-layout complete-screen hx-complete-screen">
      <div className="completion-mark">✓</div>
      <p className="eyebrow">Foundation bridge complete</p>
      <h2>Hexadecimal is compact binary notation.</h2>
      <p className="lead completion-lead">You did not invent a new kind of stored data. You learned a shorter human notation for the same bit patterns computers already manipulate.</p>
      <div className="hx-final-model">
        <div><small>4 bits</small><code>1111</code></div><span>↔</span><div><small>1 hex digit</small><strong>F</strong></div>
        <b>therefore</b>
        <div><small>1 byte</small><code>11110000</code></div><span>↔</span><div><small>2 hex digits</small><strong>F0</strong></div>
      </div>
      <div className="hx-solved-open">
        <div><small>notation</small><b>11110000₂ and F0₁₆ name the same numeric value.</b></div>
        <div><small>encoding</small><b>Choosing which bytes should represent a code point is a separate rule entirely.</b></div>
      </div>
      <div className="next-lesson-card">
        <div><small>Next mystery</small><h3>How could 🚀 at U+1F680 become bytes like F0 9F 9A 80?</h3><p>Lesson 06 showed why we need an encoding. Now we have the notation needed to inspect a real variable-length encoding bit by bit.</p></div>
        <Link className="primary-button" href="/lessons/utf-8">Start Lesson 07 →</Link>
      </div>
      <div className="hx-complete-actions"><Link href="/" className="primary-button">Back to course map</Link><button className="text-link-button" onClick={onRestart}>Replay this bridge</button></div>
    </div>
  );
}
