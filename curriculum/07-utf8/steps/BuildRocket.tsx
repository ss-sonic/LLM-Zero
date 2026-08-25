"use client";

import { Feedback } from "../../../components/ui/Feedback";
import { QuestionPrompt } from "../../../components/ui/QuestionPrompt";
import { ROCKET } from "../config";
import { allMatch, normalizeBits, normalizeHex } from "../utf8";

export function BuildRocketStep({ groups, hex, onGroup, onHex, onContinue }: { groups: string[]; hex: string[]; onGroup: (index: number, value: string) => void; onHex: (index: number, value: string) => void; onContinue: () => void }) {
  const groupsCorrect = allMatch(groups, ROCKET.payloadGroups, normalizeBits);
  const solved = groupsCorrect && allMatch(hex, ROCKET.utf8Hex, normalizeHex);
  const lengths = [3, 6, 6, 6];
  return (
    <div className="screen-layout centered-screen wide-screen u8-screen u8-rocket-screen">
      <QuestionPrompt eyebrow="Step 9 · Resolve the bridge mystery" title="Build 🚀 → F0 9F 9A 80 yourself." lead={`Pad ${ROCKET.binary} on the left to fill 21 payload positions, then split it 3 + 6 + 6 + 6.`} />
      <div className="u8-rocket-lab card">
        <div className="u8-payload-source"><small>21 payload positions</small><code>{ROCKET.paddedPayload}</code></div>
        <div className="u8-rocket-template"><code><b>11110</b>xxx</code><code><b>10</b>xxxxxx</code><code><b>10</b>xxxxxx</code><code><b>10</b>xxxxxx</code></div>
        <div className="u8-rocket-inputs">{groups.map((value, index) => <input key={index} value={value} maxLength={lengths[index]} onChange={(event) => onGroup(index, event.target.value)} placeholder={"?".repeat(lengths[index])} aria-label={`Rocket UTF-8 payload group ${index + 1}`} />)}</div>
        {groupsCorrect ? <div className="u8-rocket-bytes">{ROCKET.utf8Bits.map((bits, index) => <label key={bits}><code>{bits.slice(0,4)} {bits.slice(4)}</code><span>→</span><input value={hex[index]} maxLength={2} onChange={(event) => onHex(index, event.target.value)} placeholder="??" /></label>)}</div> : null}
      </div>
      {solved ? <Feedback tone="success"><div><b>🚀 → {ROCKET.utf8Hex.join(" ")}.</b><span>The exact byte sequence from the hexadecimal bridge is no longer a mystery: you constructed it from U+1F680.</span></div></Feedback> : null}
      {solved ? <button className="primary-button u8-main-action" onClick={onContinue}>Explain what the prefixes bought us →</button> : null}
    </div>
  );
}
