"use client";

import { QuestionPrompt } from "../../../components/ui/QuestionPrompt";
import { HEX_DIGITS } from "../config";

export function SixDigitsStep({ revealed, onReveal, onContinue }: { revealed: boolean; onReveal: () => void; onContinue: () => void }) {
  return (
    <div className="screen-layout centered-screen wide-screen hx-screen">
      <QuestionPrompt eyebrow="Step 3 · Six symbols short" title="Decimal digits give us 0–9. What do we call the other six patterns?" lead="Four bits need sixteen symbols. Humans already had ten familiar digits, so the remaining six needed names." />
      <div className="hx-digit-strip" aria-label="Values zero through fifteen">
        {HEX_DIGITS.map((digit, value) => (
          <div className={value >= 10 && !revealed ? "hidden-digit" : ""} key={value}>
            <small>{value}</small><strong>{value >= 10 && !revealed ? "?" : digit}</strong>
          </div>
        ))}
      </div>
      {!revealed ? <button className="primary-button hx-main-action" onClick={onReveal}>Reveal the convention →</button> : (
        <>
          <div className="hx-convention card">
            <div><strong>10 → A</strong><span>a naming convention</span></div>
            <div><strong>1010₂ → 10₁₀</strong><span>forced by positional mathematics</span></div>
          </div>
          <p className="quiet-copy hx-caveat">A, B, C, D, E, F are not more powerful numbers. They are compact symbols for decimal 10 through 15 when we write numbers in base 16.</p>
          <button className="primary-button hx-main-action" onClick={onContinue}>Build those symbols from bits →</button>
        </>
      )}
    </div>
  );
}
