"use client";

import Link from "next/link";

export function CompleteStep({ onRestart }: { onRestart: () => void }) {
  return (
    <div className="screen-layout complete-screen l4-complete-screen">
      <div className="completion-mark">✓</div>
      <p className="eyebrow">Lesson 04 complete</p>
      <h2>A shared table only works for characters inside the table.</h2>
      <p className="lead completion-lead">ASCII solved agreement for a small repertoire. It did not provide identities for the enormous variety of characters people need for global text.</p>

      <div className="l4-final-model" aria-label="Why ASCII is not enough for global text">
        <div><small>Shared agreement</small><b>ASCII ✓</b><span>machines interpret its entries consistently</span></div>
        <span>+</span>
        <div><small>Limited repertoire</small><b>128 values</b><span>many needed characters have no entry</span></div>
        <span>→</span>
        <div><small>New requirement</small><b>Much larger shared system</b><span>stable identities for far more characters</span></div>
      </div>

      <div className="next-lesson-card">
        <div>
          <small>Next mystery</small>
          <h3>How can one system give characters from across the world stable numeric identities?</h3>
          <p>We now know the table must grow dramatically. Next we can discover how a global character system names those characters without confusing their identity with how they are stored.</p>
        </div>
        <span className="locked-pill">🔒 Lesson 05 · Unicode and code points</span>
      </div>

      <div className="l4-complete-actions">
        <Link href="/" className="primary-button">Back to course map</Link>
        <button className="text-link-button" onClick={onRestart}>Replay this lesson</button>
      </div>
    </div>
  );
}
