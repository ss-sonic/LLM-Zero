"use client";

import { toBits } from "../../../lib/lesson/binary";

export function CompleteStep({
  agreedNumber,
  onRestart,
}: {
  agreedNumber: number;
  onRestart: () => void;
}) {
  return (
    <div className="screen-layout complete-screen">
      <div className="completion-mark">✓</div>
      <p className="eyebrow">Lesson 01 complete</p>
      <h2>Symbols do not magically live inside computers.</h2>
      <p className="lead completion-lead">Humans define representations. Computers store the representation. Shared rules let us turn it back into something meaningful.</p>

      <div className="final-pipeline" aria-label="Representation pipeline">
        <div><small>Human sees</small><b>A</b></div>
        <span>→</span>
        <div><small>We agree on</small><b>{agreedNumber}</b></div>
        <span>→</span>
        <div><small>Computer stores</small><b className="binary-small">{toBits(agreedNumber).join("")}</b></div>
      </div>

      <div className="next-lesson-card">
        <div>
          <small>Next mystery</small>
          <h3>What if every computer invents its own table?</h3>
          <p>That problem is why shared character standards had to exist.</p>
        </div>
        <span className="locked-pill">🔒 Lesson 02 · Shared character table</span>
      </div>

      <button className="text-link-button" onClick={onRestart}>Replay this lesson</button>
    </div>
  );
}
