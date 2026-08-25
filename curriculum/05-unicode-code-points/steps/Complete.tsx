"use client";

import Link from "next/link";

export function CompleteStep({ onRestart }: { onRestart: () => void }) {
  return (
    <div className="screen-layout complete-screen l5-complete-screen">
      <div className="completion-mark">✓</div>
      <p className="eyebrow">Lesson 05 complete</p>
      <h2>Unicode gives global text stable numeric identities.</h2>
      <p className="lead completion-lead">A code point tells us which position in the Unicode codespace we mean. For assigned characters, that gives everyone a shared identity without yet deciding the stored byte sequence.</p>

      <div className="l5-final-model" aria-label="Unicode identity mental model">
        <div><small>Visible character</small><b>🚀</b></div>
        <span>→</span>
        <div><small>Unicode code point</small><code>U+1F680</code><b>128640</b></div>
        <span>→</span>
        <div className="unresolved"><small>Stored bytes</small><b>?</b><span>still unresolved</span></div>
      </div>

      <div className="l5-solved-vs-open">
        <div><small>Unicode solved here</small><b>Which encoded character does this numeric identity refer to?</b></div>
        <div><small>Still unsolved</small><b>How should that code point become concrete storage units and bytes?</b></div>
      </div>

      <div className="next-lesson-card">
        <div>
          <small>Next mystery</small>
          <h3>If 🚀 is U+1F680, what actually goes into memory?</h3>
          <p>The code point is far larger than one byte. Next we will separate character identity from the encoding that turns that identity into stored data.</p>
        </div>
        <Link className="primary-button" href="/lessons/code-points-vs-bytes">Start Lesson 06 →</Link>
      </div>

      <div className="l5-complete-actions">
        <Link href="/" className="primary-button">Back to course map</Link>
        <button className="text-link-button" onClick={onRestart}>Replay this lesson</button>
      </div>
    </div>
  );
}
