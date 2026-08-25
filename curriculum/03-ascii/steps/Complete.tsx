"use client";

import Link from "next/link";

export function CompleteStep({ onRestart }: { onRestart: () => void }) {
  return (
    <div className="screen-layout complete-screen l3-complete-screen">
      <div className="completion-mark">✓</div>
      <p className="eyebrow">Lesson 03 complete</p>
      <h2>ASCII is a shared agreement, not a magical property of letters.</h2>
      <p className="lead completion-lead">It gave different computers a common character-number rulebook. The exact assignments are conventional; the binary representation of those numbers follows mathematics.</p>

      <div className="l3-final-model" aria-label="ASCII mental model">
        <div><small>Character</small><b>A</b><span>human-visible symbol</span></div>
        <span>→</span>
        <div><small>ASCII standard</small><b>65</b><span>published assignment</span></div>
        <span>→</span>
        <div><small>Binary value</small><code>1000001</code><span>7-bit positional representation</span></div>
      </div>

      <div className="l3-solved-vs-open">
        <div><small>ASCII solved</small><b>How can many computers agree on the same basic text?</b></div>
        <div><small>ASCII did not solve</small><b>How do we represent all the characters people around the world need?</b></div>
      </div>

      <div className="next-lesson-card">
        <div>
          <small>Next mystery</small>
          <h3>What happens when the world needs characters ASCII does not contain?</h3>
          <p>We found the failure. Next we will push on it hard enough to understand why a much larger character system became necessary.</p>
        </div>
        <span className="locked-pill">🔒 Lesson 04 · Break ASCII</span>
      </div>

      <div className="l3-complete-actions">
        <Link href="/" className="primary-button">Back to course map</Link>
        <button className="text-link-button" onClick={onRestart}>Replay this lesson</button>
      </div>
    </div>
  );
}
