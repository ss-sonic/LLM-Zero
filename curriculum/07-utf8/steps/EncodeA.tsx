"use client";

import { Feedback } from "../../../components/ui/Feedback";
import { QuestionPrompt } from "../../../components/ui/QuestionPrompt";
import { A } from "../config";
import { normalizeBits, normalizeHex } from "../utf8";

export function EncodeAStep({ bits, hex, onBits, onHex, onContinue }: { bits: string; hex: string; onBits: (value: string) => void; onHex: (value: string) => void; onContinue: () => void }) {
  const bitsCorrect = normalizeBits(bits) === A.utf8Bits;
  const solved = bitsCorrect && normalizeHex(hex) === A.utf8Hex;
  return (
    <div className="screen-layout centered-screen wide-screen u8-screen">
      <QuestionPrompt eyebrow="Step 4 · One-byte UTF-8" title="Put A's seven code-point bits into 0xxxxxxx." lead="A is U+0041, decimal 65, binary 1000001. The leading 0 is structure; the remaining seven positions carry the value." />
      <div className="u8-build-card card">
        <div className="u8-template-line"><code className="structure">0</code><code className="payload">xxxxxxx</code></div>
        <span>payload ← 1000001</span>
        <input value={bits} maxLength={8} onChange={(event) => onBits(event.target.value)} placeholder="????????" aria-label="UTF-8 bits for A" />
      </div>
      {bitsCorrect ? <div className="u8-hex-entry card"><code>0100 0001</code><span>→ hex</span><input value={hex} maxLength={2} onChange={(event) => onHex(event.target.value)} placeholder="??" aria-label="UTF-8 hexadecimal byte for A" /></div> : null}
      {solved ? <Feedback tone="success"><div><b>A → 01000001 → 41.</b><span>You have seen 41 before: ASCII A is also 0x41. UTF-8 deliberately preserves ASCII byte-for-byte.</span></div></Feedback> : null}
      {solved ? <button className="primary-button u8-main-action" onClick={onContinue}>Now try a value that does not fit →</button> : null}
    </div>
  );
}
