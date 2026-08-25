"use client";

import { INVENTED_SYMBOLS } from "../config";
import { isValidInventedValue } from "../unicode";
import type { InventedSymbol, InventedTable } from "../types";

export function InventIdentitiesStep({
  table,
  published,
  sent,
  onChange,
  onPublish,
  onSend,
  onContinue,
}: {
  table: InventedTable;
  published: boolean;
  sent: boolean;
  onChange: (symbol: InventedSymbol, value: number) => void;
  onPublish: () => void;
  onSend: () => void;
  onContinue: () => void;
}) {
  const values = INVENTED_SYMBOLS.map((symbol) => table[symbol]);
  const valid = values.every(isValidInventedValue) && new Set(values).size === values.length;

  return (
    <div className="screen-layout split-screen l5-builder-screen">
      <div className="screen-copy">
        <p className="eyebrow">Step 2 · Invent stable identities</p>
        <h2>Can you give very different characters unambiguous numbers?</h2>
        <p className="lead">Pick a different whole number for each entry. The exact values are your convention; the important part is publishing one table that every machine shares.</p>
        <p className="quiet-copy">This is still your invented system, not Unicode. We are building the idea before meeting the real standard.</p>
      </div>

      <div className="l5-invent-card card">
        <small>Your proposed global table</small>
        <div className="l5-invent-table">
          {INVENTED_SYMBOLS.map((symbol) => (
            <label key={symbol}>
              <b>{symbol}</b><span>→</span>
              <input
                type="number"
                min={0}
                max={999999}
                value={table[symbol]}
                disabled={published}
                onChange={(event) => onChange(symbol, Number(event.target.value))}
                aria-label={`Numeric identity for ${symbol}`}
              />
            </label>
          ))}
        </div>
        {!valid && <p className="l5-error">Use five different whole numbers from 0 to 999999.</p>}

        {!published ? (
          <button className="primary-button full-button" disabled={!valid} onClick={onPublish}>Publish this table →</button>
        ) : (
          <div className="l5-published-state">
            <div className="l5-installed-row">
              <span>Computer 1 ✓</span><span>Computer 2 ✓</span><span>Computer 3 ✓</span>
            </div>
            <p>All three machines now know the same identities before any text is sent.</p>
            {!sent ? (
              <button className="primary-button" onClick={onSend}>Send 🚀 as {table["🚀"]} →</button>
            ) : (
              <div className="l5-invent-success">
                <strong>🚀</strong><b>→</b><code>{table["🚀"]}</code><b>→</b><strong>🚀 ✓</strong>
                <p>Your exact number was arbitrary. Shared identity is what made communication work.</p>
                <button className="primary-button" onClick={onContinue}>Give this idea a name →</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
