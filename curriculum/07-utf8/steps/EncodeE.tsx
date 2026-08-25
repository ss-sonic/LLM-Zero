"use client";

import { Feedback } from "../../../components/ui/Feedback";
import { QuestionPrompt } from "../../../components/ui/QuestionPrompt";
import { E_ACUTE } from "../config";
import { allMatch, normalizeBits, normalizeHex } from "../utf8";

export function EncodeEStep({ groups, hex, onGroup, onHex, onContinue }: { groups: string[]; hex: string[]; onGroup: (index: number, value: string) => void; onHex: (index: number, value: string) => void; onContinue: () => void }) {
  const groupsCorrect = allMatch(groups, E_ACUTE.payloadGroups, normalizeBits);
  const solved = groupsCorrect && allMatch(hex, E_ACUTE.utf8Hex, normalizeHex);
  return (
    <div className="screen-layout centered-screen wide-screen u8-screen">
      <QuestionPrompt eyebrow="Step 6 · Build real UTF-8" title="Fit é's bits into the two-byte template." lead="Pad 11101001 on the left until it fills all 11 payload positions, then split the payload 5 + 6." />
      <div className="u8-payload-lab card">
        <div className="u8-payload-source"><small>code-point payload</small><code>{E_ACUTE.paddedPayload}</code></div>
        <div className="u8-payload-template"><code><b>110</b>xxxxx</code><code><b>10</b>xxxxxx</code></div>
        <div className="u8-payload-inputs">
          <input value={groups[0]} maxLength={5} onChange={(event) => onGroup(0, event.target.value)} placeholder="?????" aria-label="First five UTF-8 payload bits for é" />
          <input value={groups[1]} maxLength={6} onChange={(event) => onGroup(1, event.target.value)} placeholder="??????" aria-label="Last six UTF-8 payload bits for é" />
        </div>
      </div>
      {groupsCorrect ? (
        <div className="u8-assembled card">
          <div><small>insert the payload</small><code><b>110</b>{E_ACUTE.payloadGroups[0]}</code><code><b>10</b>{E_ACUTE.payloadGroups[1]}</code></div>
          <div className="u8-hex-pair"><label>{E_ACUTE.utf8Bits[0]} → <input value={hex[0]} maxLength={2} onChange={(event) => onHex(0, event.target.value)} placeholder="??" /></label><label>{E_ACUTE.utf8Bits[1]} → <input value={hex[1]} maxLength={2} onChange={(event) => onHex(1, event.target.value)} placeholder="??" /></label></div>
        </div>
      ) : null}
      {solved ? <Feedback tone="success"><div><b>é → C3 A9.</b><span>The prefix bits made the two-byte structure visible; the remaining bits carried code point 233.</span></div></Feedback> : null}
      {solved ? <button className="primary-button u8-main-action" onClick={onContinue}>Decode those exact bytes →</button> : null}
    </div>
  );
}
