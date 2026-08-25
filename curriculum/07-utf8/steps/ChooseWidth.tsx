"use client";

import { Feedback } from "../../../components/ui/Feedback";
import { QuestionPrompt } from "../../../components/ui/QuestionPrompt";
import { ROCKET, UTF8_PATTERNS } from "../config";

export function ChooseWidthStep({ capacities, width, onCapacity, onWidth, onContinue }: { capacities: string[]; width: string; onCapacity: (index: number, value: string) => void; onWidth: (value: string) => void; onContinue: () => void }) {
  const capacitiesCorrect = UTF8_PATTERNS.every((pattern, index) => Number(capacities[index]) === pattern.payloadBits);
  const solved = capacitiesCorrect && Number(width) === 4;
  return (
    <div className="screen-layout centered-screen wide-screen u8-screen">
      <QuestionPrompt eyebrow="Step 8 · Capacity decides the width" title="How many bytes does 🚀 need?" lead={`${ROCKET.symbol} is ${ROCKET.notation}. Its code-point value needs ${ROCKET.binary.length} binary bits. Count the x positions in each UTF-8 template before choosing.`} />
      <div className="u8-width-table card">
        {UTF8_PATTERNS.map((pattern, index) => (
          <div key={pattern.width}>
            <small>{pattern.width} byte{pattern.width > 1 ? "s" : ""}</small>
            <code>{pattern.template.join(" ")}</code>
            <label>payload bits<input type="number" value={capacities[index]} onChange={(event) => onCapacity(index, event.target.value)} /></label>
          </div>
        ))}
      </div>
      {capacitiesCorrect ? <div className="u8-width-choice card"><span>🚀 needs <b>{ROCKET.binary.length}</b> payload bits.</span><label>smallest UTF-8 width that fits<input type="number" min={1} max={4} value={width} onChange={(event) => onWidth(event.target.value)} /><small>bytes</small></label></div> : null}
      {solved ? <Feedback tone="success"><div><b>4 bytes.</b><span>Three bytes carry only 16 payload bits. Four bytes carry 21, enough for this code point.</span></div></Feedback> : null}
      {solved ? <button className="primary-button u8-main-action" onClick={onContinue}>Build all four bytes →</button> : null}
    </div>
  );
}
