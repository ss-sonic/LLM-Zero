"use client";

import { Feedback } from "../../../components/ui/Feedback";
import { QuestionPrompt } from "../../../components/ui/QuestionPrompt";
import { ROCKET } from "../config";
import { BYTE_MAX, byteWeights, decodeFixedWidth, isByteValue } from "../encoding";

const WEIGHTS = byteWeights(3);

export function InventStorageStep({
  values,
  onChange,
  onContinue,
}: {
  values: string[];
  onChange: (index: number, value: string) => void;
  onContinue: () => void;
}) {
  const numbers = values.map(Number);
  const allFilled = values.every((value) => value.trim() !== "");
  const allBytes = allFilled && numbers.every(isByteValue);
  const total = allBytes ? decodeFixedWidth(numbers) : null;
  const solved = total === ROCKET.decimal;
  const outOfRange = values.some((value, index) => value.trim() !== "" && !isByteValue(numbers[index]));

  return (
    <div className="screen-layout centered-screen wide-screen l6-screen">
      <QuestionPrompt
        eyebrow="Step 3 · Invent a storage rule"
        title={<>Can three byte-sized positions build {ROCKET.decimal.toLocaleString("en-US")}?</>}
        lead="We are going to invent a rule, not discover a Unicode rule. Treat the three bytes as base-256 positions: each place is worth 256 times the place to its right."
      />

      <div className="card l6-build-lab">
        <div className="l6-build-target"><span>target</span><strong>{ROCKET.decimal.toLocaleString("en-US")}</strong></div>
        <div className="l6-build-grid">
          {WEIGHTS.map((weight, index) => (
            <label className="l6-build-position" key={weight}>
              <small>position worth</small>
              <strong>{weight.toLocaleString("en-US")}</strong>
              <input
                type="number"
                min={0}
                max={BYTE_MAX}
                value={values[index]}
                onChange={(event) => onChange(index, event.target.value)}
                aria-label={`Byte position worth ${weight}`}
                placeholder="0–255"
              />
            </label>
          ))}
        </div>
        <div className="l6-live-total"><small>your value</small><strong>{total === null ? "—" : total.toLocaleString("en-US")}</strong></div>
      </div>

      {outOfRange ? <Feedback tone="nudge">Each position is one byte, so each entry must stay between 0 and {BYTE_MAX}.</Feedback> : null}
      {allBytes && !solved ? <p className="l6-build-hint">Your three byte values currently represent {total?.toLocaleString("en-US")}. Adjust them until the total reaches the target.</p> : null}

      {solved ? (
        <>
          <Feedback tone="success">
            <div><b>You invented one working rule.</b><span>{ROCKET.decimal.toLocaleString("en-US")} → [{numbers.join(", ")}].</span></div>
          </Feedback>
          <div className="l6-invented-rule">
            <small>our invented rule — not a real Unicode encoding</small>
            <strong>{ROCKET.symbol}</strong><span>→</span><code>{ROCKET.notation}</code><span>→</span>
            {numbers.map((byte, index) => <code key={WEIGHTS[index]}>{byte}</code>)}
          </div>
          <p className="quiet-copy l6-centered-note">We proved the number can be represented with bytes. We have not proved these particular bytes are inevitable.</p>
          <button className="primary-button l6-main-action" onClick={onContinue}>Test whether the bytes are inevitable →</button>
        </>
      ) : null}
    </div>
  );
}
