"use client";

import { UNICODE_EXAMPLES } from "../config";
import { toUnicodeNotation } from "../unicode";

export function ReadNotationStep({
  selectedId,
  seenIds,
  onSelect,
  onContinue,
}: {
  selectedId: string;
  seenIds: string[];
  onSelect: (id: string) => void;
  onContinue: () => void;
}) {
  const selected = UNICODE_EXAMPLES.find((example) => example.id === selectedId) ?? UNICODE_EXAMPLES[0];
  const ready = new Set(seenIds).size >= 3;

  return (
    <div className="screen-layout centered-screen wide-screen l5-screen">
      <div className="screen-copy centered-copy compact-copy">
        <p className="eyebrow">Step 5 · Read U+ notation</p>
        <h2>U+1F680 and 128640 name the same code point.</h2>
        <p className="lead">Unicode conventionally writes code points as <strong>U+</strong> followed by hexadecimal digits. That notation names a number; it does not tell us the stored bytes.</p>
      </div>

      <div className="l5-notation-lab card">
        <div className="l5-symbol-picker" aria-label="Unicode examples to inspect">
          {UNICODE_EXAMPLES.map((example) => (
            <button className={selected.id === example.id ? "selected" : ""} key={example.id} onClick={() => onSelect(example.id)}>
              <strong>{example.symbol}</strong><small>{toUnicodeNotation(example.decimal)}</small>
            </button>
          ))}
        </div>

        <div className="l5-notation-display">
          <div><small>Character</small><strong>{selected.symbol}</strong></div>
          <span>→</span>
          <div><small>Decimal</small><strong>{selected.decimal.toLocaleString("en-US")}</strong></div>
          <span>=</span>
          <div><small>Unicode notation</small><code>{toUnicodeNotation(selected.decimal)}</code></div>
        </div>

        <p className="l5-notation-caption">Same numeric identity, written in two number systems. Hexadecimal is just another way to write a number.</p>
        <div className="l5-inspection-meter"><span>Examples inspected</span><strong>{Math.min(new Set(seenIds).size, 3)} / 3</strong></div>
      </div>

      <details className="l5-side-note">
        <summary>Do I need to learn hexadecimal right now?</summary>
        <p>No. You only need to recognize that Unicode&apos;s U+ notation uses hexadecimal. We will unpack representation details when they become necessary.</p>
      </details>

      {ready && <button className="primary-button l5-main-action" onClick={onContinue}>Does this tell us the bytes? →</button>}
    </div>
  );
}
