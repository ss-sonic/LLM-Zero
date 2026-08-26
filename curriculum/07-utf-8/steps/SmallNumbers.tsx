"use client";

import { Feedback } from "../../../components/ui/Feedback";
import { QuestionPrompt } from "../../../components/ui/QuestionPrompt";
import { minimumWidthFor } from "../../06-code-points-vs-bytes/encoding";
import { BILL_NAIVE_BYTES, BILL_TEXT, BILL_TOTAL_BYTES, SIZE_EXAMPLES } from "../config";

export function SmallNumbersStep({
  values,
  onChange,
  onContinue,
}: {
  values: string[];
  onChange: (index: number, value: string) => void;
  onContinue: () => void;
}) {
  const expected = SIZE_EXAMPLES.map((example) => minimumWidthFor(example.codePoint) ?? 1);
  const filled = values.every((value) => value.trim() !== "");
  const matches = expected.map((width, index) => Number(values[index]) === width);
  const solved = filled && matches.every(Boolean);

  return (
    <div className="screen-layout centered-screen wide-screen l7-screen">
      <QuestionPrompt
        eyebrow="Step 2 · Small numbers, small bytes"
        title="Give each character only the byte positions its number actually needs."
        lead="Same rule as before — each position is worth 256 times the one to its right — but the width is no longer fixed. How many positions does each of these need?"
      />

      <div className="card l7-size-lab">
        {SIZE_EXAMPLES.map((example, index) => (
          <label className="l7-size-row" key={example.id}>
            <span className="l7-size-symbol">{example.symbol}</span>
            <code>{example.notation}</code>
            <b>{example.codePoint.toLocaleString("en-US")}</b>
            <input
              className={`l7-input small${matches[index] ? " right" : ""}${filled && !matches[index] ? " wrong" : ""}`}
              type="number"
              min={1}
              max={4}
              value={values[index]}
              onChange={(event) => onChange(index, event.target.value)}
              aria-label={`Byte positions needed for ${example.symbol}`}
              placeholder="?"
            />
            <small>bytes</small>
          </label>
        ))}

        {filled && !solved && (
          <Feedback tone="nudge">
            One position holds 0–255. Two hold up to 65,535. Three hold up to 16,777,215. Find the smallest that fits each number.
          </Feedback>
        )}
      </div>

      {solved && (
        <>
          <Feedback tone="success">
            <div>
              <b>{BILL_TEXT} drops from {BILL_TOTAL_BYTES} bytes to {BILL_NAIVE_BYTES}.</b>
              <span>Nothing was lost — the same characters, the same numbers, just no padding. This looks like the whole answer.</span>
            </div>
          </Feedback>
          <button className="primary-button l7-main-action" onClick={onContinue}>Now be the receiver →</button>
        </>
      )}
    </div>
  );
}
