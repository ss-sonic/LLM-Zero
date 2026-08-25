"use client";

import Link from "next/link";
import { A, E_ACUTE, ROCKET } from "../config";

export function CompleteStep({ onRestart }: { onRestart: () => void }) {
  return (
    <div className="screen-layout complete-screen u8-complete-screen">
      <div className="completion-mark">✓</div>
      <p className="eyebrow">Lesson 07 complete</p>
      <h2>UTF-8 uses structure bits to make variable-length bytes decodable.</h2>
      <p className="lead completion-lead">You started with wasted fixed-width storage, created the boundary problem, then used UTF-8's prefix patterns to encode and decode real Unicode code points by hand.</p>
      <div className="u8-example-strip">
        <div><strong>{A.symbol}</strong><code>{A.notation}</code><span>→</span><b>{A.utf8Hex}</b><small>1 byte</small></div>
        <div><strong>{E_ACUTE.symbol}</strong><code>{E_ACUTE.notation}</code><span>→</span><b>{E_ACUTE.utf8Hex.join(" ")}</b><small>2 bytes</small></div>
        <div><strong>{ROCKET.symbol}</strong><code>{ROCKET.notation}</code><span>→</span><b>{ROCKET.utf8Hex.join(" ")}</b><small>4 bytes</small></div>
      </div>
      <div className="u8-final-model">
        <div><small>Unicode</small><b>stable code point</b></div><span>→</span><div><small>UTF-8</small><b>1–4 bytes</b></div><span>→</span><div><small>inside each byte</small><b>structure + payload bits</b></div>
      </div>
      <div className="u8-solved-open"><div><small>design win</small><b>ASCII stays one byte, while larger code points get more room only when needed.</b></div><div><small>next problem</small><b>UTF-8 is not the only Unicode encoding. What tradeoffs produce UTF-16 and UTF-32?</b></div></div>
      <div className="next-lesson-card"><div><small>Next lesson</small><h3>UTF-8 vs UTF-16 vs UTF-32</h3><p>Same Unicode identities, different concrete encoding strategies.</p></div><span className="locked-pill">🔒 Lesson 08</span></div>
      <div className="u8-complete-actions"><Link href="/" className="primary-button">Back to course map</Link><button className="text-link-button" onClick={onRestart}>Replay this lesson</button></div>
    </div>
  );
}
