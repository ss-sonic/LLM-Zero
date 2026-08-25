"use client";

import type { TinyStandard } from "../types";

const symbols = ["A", "B", "C"] as const;

export function PublishStandardStep({
  table,
  published,
  sent,
  onChange,
  onPublish,
  onSend,
  onContinue,
}: {
  table: TinyStandard;
  published: boolean;
  sent: boolean;
  onChange: (symbol: keyof TinyStandard, value: number) => void;
  onPublish: () => void;
  onSend: () => void;
  onContinue: () => void;
}) {
  const values = symbols.map((symbol) => table[symbol]);
  const valid = values.every((value) => Number.isInteger(value) && value >= 0 && value <= 255)
    && new Set(values).size === values.length;
  const encoded = [table.C, table.A, table.B];

  return (
    <div className="screen-layout split-screen l3-builder-screen">
      <div className="screen-copy">
        <p className="eyebrow">Step 2 · Publish a standard</p>
        <h2>Can three computers use one rulebook without negotiating?</h2>
        <p className="lead">Assign A, B, and C three different numbers. Then publish the table once so every machine installs the exact same mapping.</p>
        <p className="quiet-copy">The numbers themselves are still your choice. What changes is that the rule is now shared in advance.</p>
      </div>

      <div className="l3-publish-card card">
        <small>Your tiny proposed standard</small>
        <div className="l3-edit-table">
          {symbols.map((symbol) => (
            <label key={symbol}>
              <b>{symbol}</b><span>→</span>
              <input
                type="number"
                min={0}
                max={255}
                value={table[symbol]}
                disabled={published}
                onChange={(event) => onChange(symbol, Number(event.target.value))}
                aria-label={`Number for ${symbol}`}
              />
            </label>
          ))}
        </div>
        {!valid && <p className="l3-error">Use three different whole numbers between 0 and 255.</p>}

        {!published ? (
          <button className="primary-button full-button" disabled={!valid} onClick={onPublish}>Publish this table →</button>
        ) : (
          <div className="l3-published-state">
            <div className="l3-installed-row">
              {["Computer 1", "Computer 2", "Computer 3"].map((name) => <span key={name}>{name} ✓</span>)}
            </div>
            <p>All three machines installed the same published rulebook.</p>
            {!sent ? (
              <button className="primary-button" onClick={onSend}>Send CAB as {encoded.join(" · ")} →</button>
            ) : (
              <div className="l3-standard-success">
                <code>{encoded.join("  ")}</code><span>→</span><strong>CAB ✓</strong>
                <p>No pair negotiated. The published agreement was already waiting at both ends.</p>
                <button className="primary-button" onClick={onContinue}>Meet a real standard →</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
