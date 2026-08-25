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
  const shownValues = values.map((value) => value.trim() === "" ? "?" : value);

  return (
    <div className="screen-layout centered-screen wide-screen l6-screen">
      <QuestionPrompt
        eyebrow="Step 3 · Invent a storage rule"
        title={<>Can three byte-sized positions build {ROCKET.decimal.toLocaleString("en-US")}?</>}
        lead="Use the same positional idea as decimal and binary, but make each position 256 times the one to its right. We are inventing a rule, not discovering a Unicode encoding."
      />

      <div className="card l6-build-lab">
        <div className="l6-build-target"><span>the whole rule</span><strong>N = B₁ × 65,536 + B₂ × 256 + B₃ × 1</strong></div>
        <p className="quiet-copy l6-centered-note">N is the number we want to represent. B₁, B₂, and B₃ are the three byte values, each between 0 and 255.</p>

        <div className="l6-build-target"><span>target N</span><strong>{ROCKET.decimal.toLocaleString("en-US")}</strong></div>
        <div className="l6-build-grid">
          {WEIGHTS.map((weight, index) => (
            <label className="l6-build-position" key={weight}>
              <small>B{index + 1} · position worth</small>
              <strong>{weight.toLocaleString("en-US")}</strong>
              <input
                type="number"
                min={0}
                max={BYTE_MAX}
                value={values[index]}
                onChange={(event) => onChange(index, event.target.value)}
                aria-label={`B${index + 1}, byte position worth ${weight}`}
                placeholder="0–255"
              />
            </label>
          ))}
        </div>

        <div className="l6-live-total">
          <small>your equation</small>
          <strong>{shownValues[0]}×65,536 + {shownValues[1]}×256 + {shownValues[2]}×1 = {total === null ? "?" : total.toLocaleString("en-US")}</strong>
        </div>
      </div>

      {outOfRange ? <Feedback tone="nudge">Each B value is one byte, so it must stay between 0 and {BYTE_MAX}.</Feedback> : null}
      {allBytes && !solved ? <p className="l6-build-hint">Your equation currently equals {total?.toLocaleString("en-US")}. Adjust B₁, B₂, and B₃ until it equals the target.</p> : null}

      {solved ? (
        <>
          <Feedback tone="success">
            <div><b>You solved the equation for the three bytes.</b><span>{ROCKET.decimal.toLocaleString("en-US")} = {numbers[0]}×65,536 + {numbers[1]}×256 + {numbers[2]}×1, so the bytes are [{numbers.join(", ")}].</span></div>
          </Feedback>
          <div className="l6-invented-rule">
            <small>our invented rule — not a real Unicode encoding</small>
            <strong>{ROCKET.symbol}</strong><span>→</span><code>{ROCKET.notation}</code><span>→</span>
            {numbers.map((byte, index) => <code key={WEIGHTS[index]}>{byte}</code>)}
          </div>
          <p className="quiet-copy l6-centered-note">Keep this equation. Later, encoding will mean solving it from N to the B values; decoding will mean using the B values to recover N.</p>
          <button className="primary-button l6-main-action" onClick={onContinue}>Test whether the bytes are inevitable →</button>
        </>
      ) : null}
    </div>
  );
}
