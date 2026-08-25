import type { MappingTable, SymbolKey } from "../types";

const targetSymbols: SymbolKey[] = ["C", "A", "B"];

function symbolForValue(table: MappingTable, value: number) {
  return (Object.entries(table).find(([, mapped]) => mapped === value)?.[0] ?? "?") as string;
}

export function MessageChallengeStep({
  table,
  encodedValues,
  messageSent,
  receiverBroken,
  onChoose,
  onSend,
  onBreakReceiver,
  onFinish,
}: {
  table: MappingTable;
  encodedValues: Array<number | null>;
  messageSent: boolean;
  receiverBroken: boolean;
  onChoose: (index: number, value: number) => void;
  onSend: () => void;
  onBreakReceiver: () => void;
  onFinish: () => void;
}) {
  const options = [table.A, table.B, table.C];
  const expected = targetSymbols.map((symbol) => table[symbol]);
  const allSelected = encodedValues.every((value) => value !== null);
  const correct = expected.every((value, index) => encodedValues[index] === value);
  const sequence = encodedValues.filter((value): value is number => value !== null);
  const decoded = messageSent
    ? sequence.map((value) => receiverBroken && value === table.B ? "X" : symbolForValue(table, value)).join("")
    : "";

  return (
    <div className="screen-layout centered-screen wide-screen l2-screen">
      <div className="screen-copy centered-copy compact-copy">
        <p className="eyebrow">Step 6 · Encode, send, decode</p>
        <h2>Send the message CAB using only numbers.</h2>
        <p className="lead">Use the shared table you just proved works. Choose the number that represents each character.</p>
      </div>

      <div className="l2-message-builder card">
        <div className="l2-symbol-targets">
          {targetSymbols.map((symbol, index) => (
            <div className="l2-symbol-slot" key={`${symbol}-${index}`}>
              <strong>{symbol}</strong>
              <span>↓</span>
              <div className="l2-number-options">
                {options.map((value) => (
                  <button
                    className={encodedValues[index] === value ? "selected" : ""}
                    key={value}
                    onClick={() => onChoose(index, value)}
                    aria-label={`Use ${value} for ${symbol}`}
                  >{value}</button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {allSelected && !correct && <p className="l2-builder-error">One or more numbers do not match the shared table. Look up each symbol again.</p>}
        {correct && !messageSent && (
          <div className="l2-encoded-ready">
            <span>CAB becomes</span><code>{expected.join("  ")}</code>
            <button className="primary-button" onClick={onSend}>Send only these numbers →</button>
          </div>
        )}

        {messageSent && (
          <div className="l2-decode-stage">
            <div><small>Numbers on the wire</small><code>{sequence.join("  ")}</code></div>
            <span>→ decode with receiver&apos;s table →</span>
            <div><small>Receiver reads</small><strong className={receiverBroken ? "broken-word" : ""}>{decoded}</strong></div>
          </div>
        )}
      </div>

      {messageSent && !receiverBroken && (
        <div className="l2-break-panel">
          <p><b>CAB arrived correctly.</b> Now change only Computer 2&apos;s interpretation of the number {table.B}: make it mean X instead of B.</p>
          <button className="primary-button" onClick={onBreakReceiver}>Break one receiver rule →</button>
        </div>
      )}

      {receiverBroken && (
        <div className="feedback l2-mismatch-feedback">
          <div><b>The numbers did not change: {sequence.join(", ")}.</b><span>Only one receiver rule changed, and CAB became {decoded}. Meaning came from the shared interpretation.</span></div>
          <button className="primary-button" onClick={onFinish}>Finish the lesson →</button>
        </div>
      )}
    </div>
  );
}
