"use client";

import Link from "next/link";
import { ROCKET, STREAM_BYTES, STREAM_TEXT } from "../config";
import { MAX_CODE_POINT } from "../utf8";

export function CompleteStep({ onRestart }: { onRestart: () => void }) {
  return (
    <div className="screen-layout complete-screen l7-complete-screen">
      <div className="completion-mark">✓</div>
      <p className="eyebrow">Lesson 07 complete</p>
      <h2>An encoding can carry its own structure.</h2>
      <p className="lead completion-lead">
        You started from wasted bytes, made characters variable in length, broke the receiver&apos;s ability to read them,
        and then rebuilt it out of bits nobody was using — arriving at the encoding almost all of the world&apos;s text is
        stored in today.
      </p>

      <div className="l7-final-model" aria-label="Character to code point to UTF-8 to bytes">
        <div><small>character</small><strong>{ROCKET.symbol}</strong></div>
        <span>→</span>
        <div><small>Unicode code point</small><code>{ROCKET.notation}</code></div>
        <span>→</span>
        <div><small>UTF-8</small><strong>tag + slice</strong></div>
        <span>→</span>
        <div><small>bytes</small><code>{ROCKET.bytesHex.join(" ")}</code></div>
        <span>→</span>
        <div><small>bits</small><strong className="l7-final-bits">{ROCKET.bytesBinary.join("")}</strong></div>
      </div>

      <div className="l7-earned">
        <div><small>Compact</small><b>{STREAM_TEXT} costs {STREAM_BYTES.length} bytes, not 27.</b><span>ASCII characters pay one byte; only rare characters pay four.</span></div>
        <div><small>Self-delimiting</small><b>No length is ever sent beside the bytes.</b><span>A first byte carries its own count, and a lost byte costs one character.</span></div>
        <div><small>Backwards compatible</small><b>Every ASCII file is already valid UTF-8.</b><span>CAT is 67 65 84 in both — the same bytes Lesson 03 sent.</span></div>
      </div>

      <div className="l7-solved-open">
        <div><small>now understood</small><b>How a code point becomes bytes that can be read back without help.</b></div>
        <div><small>new problem</small><b>If UTF-8 does all of this, why does more than one Unicode encoding exist — and why does Unicode stop at {MAX_CODE_POINT.toLocaleString("en-US")}?</b></div>
      </div>

      <div className="next-lesson-card pending">
        <div>
          <small>Next</small>
          <h3>UTF-8 vs UTF-16 vs UTF-32</h3>
          <p>The ceiling you met in step 6 was not UTF-8&apos;s. It was inherited from a different encoding, which made a different bet about how big characters would get.</p>
        </div>
        <span className="l7-pending-badge">Coming next</span>
      </div>

      <div className="l7-complete-actions">
        <Link href="/" className="primary-button">Back to course map</Link>
        <button className="text-link-button" onClick={onRestart}>Replay this lesson</button>
      </div>
    </div>
  );
}
