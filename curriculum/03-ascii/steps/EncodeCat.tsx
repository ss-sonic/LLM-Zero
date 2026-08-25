"use client";

import { CAT_ASCII } from "../config";

const target = ["C", "A", "T"] as const;
const options = [65, 66, 67, 84, 97];

export function EncodeCatStep({
  values,
  sent,
  onChoose,
  onSend,
  onContinue,
}: {
  values: Array<number | null>;
  sent: boolean;
  onChoose: (index: number, value: number) => void;
  onSend: () => void;
  onContinue: () => void;
}) {
  const expected = target.map((symbol) => CAT_ASCII[symbol]);
  const allSelected = values.every((value) => value !== null);
  const correct = expected.every((value, index) => values[index] === value);

  return (
    <div className="screen-layout centered-screen wide-screen l3-screen">
      <div className="screen-copy centered-copy compact-copy">
        <p className="eyebrow">Step 6 · Encode with ASCII</p>
        <h2>Can you send CAT using ASCII numbers only?</h2>
        <p className="lead">Look up each character in the same published rulebook. The receiver will use that same rulebook in reverse.</p>
      </div>

      <div className="l3-cat-card card">
        <div className="l3-cat-slots">
          {target.map((symbol, index) => (
            <div className="l3-cat-slot" key={`${symbol}-${index}`}>
              <strong>{symbol}</strong><span>↓ ASCII ↓</span>
              <div className="l3-number-options">
                {options.map((option) => (
                  <button
                    className={values[index] === option ? "selected" : ""}
                    key={option}
                    onClick={() => onChoose(index, option)}
                    aria-label={`Use ASCII value ${option} for ${symbol}`}
                  >{option}</button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {allSelected && !correct && <p className="l3-error">At least one value does not match ASCII. Hint: C is 67, A is 65, and uppercase letters live in the 65–90 range.</p>}

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
          <div><b>That is ASCII doing its job.</b><span>The machines did not need to invent a new mapping for this message. They already shared the standard.</span></div>
          <button className="primary-button" onClick={onContinue}>Now try to break ASCII →</button>
        </div>
      )}
    </div>
  );
}
