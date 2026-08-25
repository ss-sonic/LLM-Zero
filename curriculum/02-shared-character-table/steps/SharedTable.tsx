import type { MappingTable, SymbolKey } from "../types";

const symbols: SymbolKey[] = ["A", "B", "C"];

export function SharedTableStep({
  table,
  applied,
  sent,
  onChange,
  onApply,
  onSend,
  onContinue,
}: {
  table: MappingTable;
  applied: boolean;
  sent: boolean;
  onChange: (symbol: SymbolKey, value: number) => void;
  onApply: () => void;
  onSend: () => void;
  onContinue: () => void;
}) {
  const values = symbols.map((symbol) => table[symbol]);
  const valid = values.every((value) => Number.isInteger(value) && value >= 0 && value <= 255)
    && new Set(values).size === values.length;

  return (
    <div className="screen-layout split-screen l2-builder-screen">
      <div className="screen-copy">
        <p className="eyebrow">Step 4 · Build one table</p>
        <h2>Make one rulebook, then copy it to both computers.</h2>
        <p className="lead">Pick three different whole numbers from 0 to 255. There is still no magical number for A, B, or C.</p>
        <p className="quiet-copy">The only requirement in this tiny table is that each symbol gets an unambiguous value.</p>
      </div>

      <div className="l2-shared-builder card">
        <small>Your shared character table</small>
        <div className="l2-edit-table">
          {symbols.map((symbol) => (
            <label key={symbol}>
              <b>{symbol}</b><span>→</span>
              <input
                type="number"
                min={0}
                max={255}
                value={table[symbol]}
                onChange={(event) => onChange(symbol, Number(event.target.value))}
                aria-label={`Number for ${symbol}`}
              />
            </label>
          ))}
        </div>
        {!valid && <p className="l2-builder-error">Use three different whole numbers between 0 and 255.</p>}
        <button className="primary-button full-button" disabled={!valid} onClick={onApply}>Use this exact table on both computers</button>

        {applied && (
          <div className="l2-applied-panel">
            <div className="l2-copy-badge">Computer 1 ✓</div>
            <span>same table</span>
            <div className="l2-copy-badge">Computer 2 ✓</div>
            {!sent ? (
              <button className="primary-button" onClick={onSend}>Now send C as {table.C} →</button>
            ) : (
              <div className="l2-success-send">
                <strong>{table.C}</strong><span>travels</span><strong>C</strong>
                <p>Both sides interpret the number with the same rule, so C survives the trip.</p>
                <button className="primary-button" onClick={onContinue}>But do these numbers matter? →</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
