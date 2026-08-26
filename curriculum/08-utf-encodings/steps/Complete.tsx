"use client";

import Link from "next/link";
import { CEILING, ROCKET } from "../config";
import { toHex } from "../encodings";
import { encodeCodePoint, toHexByte } from "../../07-utf-8/utf8";

const UTF8_BYTES = encodeCodePoint(ROCKET.decimal)!.map(toHexByte);

export function CompleteStep({ onRestart }: { onRestart: () => void }) {
  return (
    <div className="screen-layout complete-screen l8-complete-screen">
      <div className="completion-mark">✓</div>
      <p className="eyebrow">Lesson 08 complete</p>
      <h2>An encoding is a bet, and files make it permanent.</h2>
      <p className="lead completion-lead">
        UTF-16 bet that 65,536 characters would be enough. When it lost, it could not widen its unit, because by then the
        world was full of files and programs that assumed the old one — so it patched itself, and every encoding since has
        had to live inside the shape of that patch.
      </p>

      <div className="l8-final-model" aria-label="One character under three encodings">
        <div><small>character</small><strong>{ROCKET.symbol}</strong></div>
        <span>→</span>
        <div><small>code point</small><code>{ROCKET.notation}</code></div>
        <span>→</span>
        <div><small>UTF-8</small><code>{UTF8_BYTES.join(" ")}</code><span>4 bytes</span></div>
        <div><small>UTF-16</small><code>{toHex(ROCKET.highUnit, 4)} {toHex(ROCKET.lowUnit, 4)}</code><span>4 bytes</span></div>
        <div><small>UTF-32</small><code>000{toHex(ROCKET.decimal, 5)}</code><span>4 bytes</span></div>
      </div>

      <div className="l8-earned">
        <div><small>debt paid</small><b>Unicode stops at {CEILING.toLocaleString("en-US")} because a pair of reserved 1,024-entry blocks reaches exactly that far.</b><span>Lesson 07 met the number and deferred the reason. It is the size of a patch, not a statement about language.</span></div>
        <div><small>debt paid</small><b>More than one encoding exists because they were designed at different times, under different constraints.</b><span>None of them can be retired, because text encoded under each of them still exists.</span></div>
        <div><small>new tool</small><b>Byte order only exists when a unit is wider than a byte.</b><span>Which is the last thing UTF-8 gets for free, on top of ASCII compatibility and self-synchronisation.</span></div>
      </div>

      <div className="l8-solved-open">
        <div><small>now understood</small><b>How the same character becomes three different byte sequences, and why each rule chose what it did.</b></div>
        <div><small>next</small><b>You have every piece of the path from a visible symbol to bytes. Can you trace one all the way through, without help?</b></div>
      </div>

      <div className="next-lesson-card pending">
        <div>
          <small>Next</small>
          <h3>Challenge — trace a multilingual sentence from symbols to bytes</h3>
          <p>No new ideas. Every step of the pipeline you have built, applied end to end to a sentence that uses all of it.</p>
        </div>
        <span className="l8-pending-badge">Coming next</span>
      </div>

      <div className="l8-complete-actions">
        <Link href="/" className="primary-button">Back to course map</Link>
        <button className="text-link-button" onClick={onRestart}>Replay this lesson</button>
      </div>
    </div>
  );
}
