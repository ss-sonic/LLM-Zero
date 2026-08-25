"use client";

import Link from "next/link";
import { ROCKET, TOY_RULE_NAME } from "../config";

export function CompleteStep({ onRestart }: { onRestart: () => void }) {
  return (
    <div className="screen-layout complete-screen l6-complete-screen">
      <div className="completion-mark">✓</div>
      <p className="eyebrow">Lesson 06 complete</p>
      <h2>A code point is not a byte.</h2>
      <p className="lead completion-lead">
        Unicode says which character you mean. An encoding says which bytes stand for it. Those are two separate agreements, and only the second one
        decides what actually lands in memory.
      </p>

      <div className="l6-final-model" aria-label="Complete representation pipeline">
        <div><small>character</small><b>{ROCKET.symbol}</b></div>
        <span>→</span>
        <div><small>code point</small><code>{ROCKET.notation}</code></div>
        <span>→</span>
        <div><small>encoding</small><b>{TOY_RULE_NAME}</b></div>
        <span>→</span>
        <div><small>bytes</small><b>1 · 246 · 128</b></div>
        <span>→</span>
        <div><small>bits</small><b className="l6-bit-string">00000001 11110110 10000000</b></div>
      </div>

      <div className="l6-solved-vs-open">
        <div><small>Lesson 06 solved</small><b>Turning a code point into bytes requires a rule, and that rule is a choice.</b></div>
        <div><small>Still unsolved</small><b>Every rule we built spends the same room on every character, whether it needs it or not.</b></div>
      </div>

      <div className="next-lesson-card">
        <div>
          <small>Next mystery</small>
          <h3>Can one encoding use a single byte for small values and more for larger ones?</h3>
          <p>
            First a short foundation bridge on reading bytes as hexadecimal, which makes the byte patterns far easier to inspect. Then we build UTF-8 by
            hand and find out why its particular rule was worth designing.
          </p>
        </div>
        <span className="locked-pill">🔒 Next · Binary ↔ hexadecimal bridge</span>
      </div>

      <div className="l6-complete-actions">
        <Link href="/" className="primary-button">Back to course map</Link>
        <button className="text-link-button" onClick={onRestart}>Replay this lesson</button>
      </div>
    </div>
  );
}
