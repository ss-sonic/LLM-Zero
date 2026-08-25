"use client";

import { Feedback } from "../../../components/ui/Feedback";
import { QuestionPrompt } from "../../../components/ui/QuestionPrompt";
import { BUILD_TARGETS, NIBBLE_WEIGHTS } from "../config";
import { bitsToValue, nibbleToHex } from "../hex";

export function BuildDigitsStep({ bits, builtTargets, onToggle, onContinue }: { bits: string[]; builtTargets: string[]; onToggle: (index: number) => void; onContinue: () => void }) {
  const target = BUILD_TARGETS.find((item) => !builtTargets.includes(item.hex));
  const complete = builtTargets.length === BUILD_TARGETS.length;
  const value = bitsToValue(bits);
  return (
    <div className="screen-layout centered-screen wide-screen hx-screen">
      <QuestionPrompt eyebrow="Step 4 · One hex digit = four bits" title={complete ? "You can now read a four-bit group." : <>Build hex digit {target?.hex} without a lookup table.</>} lead={complete ? "The symbol changed. The underlying four-bit value did not." : `Target ${target?.hex} means decimal ${target?.decimal}. Use the four binary place values to make it yourself.`} />
      <div className="hx-builder card">
        <div className="hx-target"><small>current bits</small><code>{bits.join("")}</code><span>decimal {value}</span><strong>hex {nibbleToHex(bits)}</strong></div>
        <div className="hx-bit-grid">
          {bits.map((bit, index) => <div className="hx-bit-cell" key={NIBBLE_WEIGHTS[index]}><small>{NIBBLE_WEIGHTS[index]}</small><button className={bit === "1" ? "on" : ""} onClick={() => onToggle(index)}>{bit}</button></div>)}
        </div>
        <div className="hx-built-progress">{BUILD_TARGETS.map((item) => <span className={builtTargets.includes(item.hex) ? "done" : ""} key={item.hex}>{builtTargets.includes(item.hex) ? "✓" : "·"} {item.hex}</span>)}</div>
      </div>
      {complete ? (
        <>
          <Feedback tone="success"><div><b>Exactly: one hex digit carries the same information as four bits.</b><span>That is why hexadecimal fits binary so neatly. No approximation and no information loss.</span></div></Feedback>
          <button className="primary-button hx-main-action" onClick={onContinue}>Now use a whole byte →</button>
        </>
      ) : null}
    </div>
  );
}
