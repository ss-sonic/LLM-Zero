"use client";

import { Feedback } from "../../../components/ui/Feedback";
import { QuestionPrompt } from "../../../components/ui/QuestionPrompt";
import { E_ACUTE } from "../config";

export function WhyTwoBytesStep({ payload, bitLength, onPayload, onBitLength, onContinue }: { payload: string; bitLength: string; onPayload: (value: string) => void; onBitLength: (value: string) => void; onContinue: () => void }) {
  const solved = Number(payload) === 7 && Number(bitLength) === 8;
  return (
    <div className="screen-layout centered-screen wide-screen u8-screen">
      <QuestionPrompt eyebrow="Step 5 · One byte hits its limit" title="Why can't é use the same one-byte form?" lead={`${E_ACUTE.symbol} is ${E_ACUTE.notation}, decimal ${E_ACUTE.decimal}, binary ${E_ACUTE.binary}. Count the available payload slots, then count the bits we need to carry.`} />
      <div className="u8-capacity-lab card">
        <div><small>1-byte template</small><code><b>0</b>xxxxxxx</code><label>payload slots<input type="number" value={payload} onChange={(event) => onPayload(event.target.value)} /></label></div>
        <span>vs</span>
        <div><small>é code point</small><code>{E_ACUTE.binary}</code><label>bits needed<input type="number" value={bitLength} onChange={(event) => onBitLength(event.target.value)} /></label></div>
      </div>
      {(payload || bitLength) && !solved ? <Feedback tone="nudge">The leading 0 is structural, so only seven positions are payload. Count the eight digits in 11101001.</Feedback> : null}
      {solved ? <Feedback tone="success"><div><b>7 payload slots cannot carry an 8-bit value.</b><span>The two-byte template gives 5 + 6 = 11 payload positions, so é has room there.</span></div></Feedback> : null}
      {solved ? <button className="primary-button u8-main-action" onClick={onContinue}>Fit é into two bytes →</button> : null}
    </div>
  );
}
