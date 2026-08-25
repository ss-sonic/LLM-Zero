"use client";

import { Feedback } from "../../../components/ui/Feedback";
import { QuestionPrompt } from "../../../components/ui/QuestionPrompt";
import { E_ACUTE } from "../config";
import { allMatch, normalizeBits } from "../utf8";

export function DecodeEStep({ groups, decimal, onGroup, onDecimal, onContinue }: { groups: string[]; decimal: string; onGroup: (index: number, value: string) => void; onDecimal: (value: string) => void; onContinue: () => void }) {
  const groupsCorrect = allMatch(groups, E_ACUTE.payloadGroups, normalizeBits);
  const solved = groupsCorrect && Number(decimal) === E_ACUTE.decimal;
  return (
    <div className="screen-layout centered-screen wide-screen u8-screen">
      <QuestionPrompt eyebrow="Step 7 · Run the same example backward" title="C3 A9 arrived. Recover é without changing examples." lead="Convert the bytes to bits, recognize the 110… 10… structure, remove only those structural prefixes, and rejoin the payload." />
      <div className="u8-decode-lab card">
        <div className="u8-byte-columns"><div><small>C3</small><code><b>110</b>00011</code></div><div><small>A9</small><code><b>10</b>101001</code></div></div>
        <div className="u8-strip-row"><span>remove structure →</span><input value={groups[0]} maxLength={5} onChange={(event) => onGroup(0, event.target.value)} placeholder="?????" /><input value={groups[1]} maxLength={6} onChange={(event) => onGroup(1, event.target.value)} placeholder="??????" /></div>
        {groupsCorrect ? <div className="u8-rejoined"><small>rejoined payload</small><code>{E_ACUTE.paddedPayload}</code><span>binary value →</span><input type="number" value={decimal} onChange={(event) => onDecimal(event.target.value)} placeholder="?" /></div> : null}
      </div>
      {solved ? <Feedback tone="success"><div><b>C3 A9 → 233 → U+00E9 → é.</b><span>Encoding and decoding are the same UTF-8 rule traversed in opposite directions.</span></div></Feedback> : null}
      {solved ? <div className="u8-roundtrip"><strong>é</strong><span>encode →</span><code>C3 A9</code><span>→ decode</span><strong>é</strong></div> : null}
      {solved ? <button className="primary-button u8-main-action" onClick={onContinue}>Scale the idea to 🚀 →</button> : null}
    </div>
  );
}
