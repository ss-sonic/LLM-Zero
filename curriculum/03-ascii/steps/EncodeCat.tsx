"use client";

import { Feedback } from "../../../components/ui/Feedback";
import { QuestionPrompt } from "../../../components/ui/QuestionPrompt";
import { CAT_ASCII } from "../config";

const TARGET = ["C", "A", "T"] as const;

/**
 * A construction, not a menu.
 *
 * Offering five candidate numbers let a learner finish by elimination. Typing the
 * values means reading the standard's structure — uppercase letters run
 * consecutively from A = 65 — and working T out rather than spotting it.
 */
export function EncodeCatStep({
  values,
  sent,
  onChange,
  onSend,
  onContinue,
}: {
  values: string[];
  sent: boolean;
  onChange: (index: number, value: string) => void;
  onSend: () => void;
  onContinue: () => void;
}) {
  const expected = TARGET.map((symbol) => CAT_ASCII[symbol]);
  const entered = values.map((value) => value.trim());
  const allFilled = entered.every((value) => value !== "");
  const matches = expected.map((value, index) => Number(entered[index]) === value);
  const correct = allFilled && matches.every(Boolean);

  return (
    <div className="screen-layout centered-screen wide-screen l3-screen">
      <QuestionPrompt
        eyebrow="Step 6 · Encode with ASCII"
        title="Can you send CAT using ASCII numbers only?"
        lead="No table on this screen. Use what the standard's structure tells you: the uppercase letters were deliberately laid out in one consecutive run."
      />

      <div className="l3-cat-card card">
        <div className="l3-cat-slots">
          {TARGET.map((symbol, index) => (
            <label className="l3-cat-slot" key={`${symbol}-${index}`}>
              <strong>{symbol}</strong><span>↓ ASCII ↓</span>
              <input
                className={`l3-cat-input${allFilled && !matches[index] ? " wrong" : ""}${matches[index] ? " right" : ""}`}
                type="number"
                min={0}
                max={127}
                value={values[index]}
                onChange={(event) => onChange(index, event.target.value)}
                aria-label={`ASCII value for ${symbol}`}
                placeholder="?"
              />
            </label>
          ))}
        </div>

        {allFilled && !correct && (
          <Feedback tone="nudge">
            At least one value is not what ASCII published. A is 65 and the uppercase run continues one number at a time from there — count to the letter you need.
          </Feedback>
        )}

        {correct && !sent && (
          <div className="l3-ready-send">
            <span>CAT becomes</span><code>{expected.join("  ")}</code>
            <button className="primary-button" onClick={onSend}>Send only the numbers →</button>
          </div>
        )}

        {sent && (
          <div className="l3-cat-transmission">
            <div><small>Sender encodes</small><strong>CAT</strong></div>
            <span>→</span>
            <div><small>Numbers travel</small><code>{expected.join("  ")}</code></div>
            <span>→</span>
            <div><small>Receiver decodes</small><strong>CAT ✓</strong></div>
          </div>
        )}
      </div>

      {sent && (
        <div className="feedback success-feedback">
          <div><b>That is ASCII doing its job.</b><span>Neither machine invented anything for this message. They already shared the standard — and you could produce it from the standard&apos;s structure alone.</span></div>
          <button className="primary-button" onClick={onContinue}>Now try to break ASCII →</button>
        </div>
      )}
    </div>
  );
}
