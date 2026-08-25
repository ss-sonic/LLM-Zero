"use client";

import { Feedback } from "../../../components/ui/Feedback";
import { QuestionPrompt } from "../../../components/ui/QuestionPrompt";
import { ROCKET, TOY_WIDTH } from "../config";
import { BYTE_MAX, byteWeights, encodeFixedWidth } from "../encoding";

const WEIGHTS = byteWeights(TOY_WIDTH);
const ROCKET_BYTES = encodeFixedWidth(ROCKET.decimal, TOY_WIDTH) ?? [];

export function RoundTripStep({
  encodeInputs,
  decodeInput,
  onEncodeChange,
  onDecodeChange,
  onContinue,
}: {
  encodeInputs: string[];
  decodeInput: string;
  onEncodeChange: (index: number, value: string) => void;
  onDecodeChange: (value: string) => void;
  onContinue: () => void;
}) {
  const encodeDone = ROCKET_BYTES.every((byte, index) => encodeInputs[index].trim() !== "" && Number(encodeInputs[index]) === byte);
  const encodeAttempted = encodeInputs.every((value) => value.trim() !== "");
  const decodeDone = decodeInput.trim() !== "" && Number(decodeInput) === ROCKET.decimal;
  const decodeAttempted = decodeInput.trim() !== "";

  return (
    <div className="screen-layout centered-screen wide-screen l6-screen">
      <QuestionPrompt
        eyebrow="Step 7 · One rule, two directions"
        title="Can you turn one identity into bytes — and recover that same identity?"
        lead="Keep the example fixed. First solve the rule for the bytes. Then take those exact bytes and run the same relationship backward."
      />

      <div className="card l6-build-lab">
        <div className="l6-build-target"><span>one rule</span><strong>N = B₁ × 65,536 + B₂ × 256 + B₃ × 1</strong></div>
        <p className="quiet-copy l6-centered-note">
          <b>Encode:</b> N is known, so solve for B₁, B₂, B₃. <b>Decode:</b> B₁, B₂, B₃ are known, so calculate N.
        </p>
      </div>

      <div className="l6-roundtrip-grid">
        <div className="card l6-exercise">
          <small>encode</small>
          <h3>Without looking back: {ROCKET.symbol} has code point {ROCKET.decimal.toLocaleString("en-US")}. Rebuild its three bytes.</h3>
          <div className="l6-mini-inputs">
            {WEIGHTS.map((weight, index) => (
              <label key={weight}>
                <span>× {weight.toLocaleString("en-US")}</span>
                <input
                  type="number"
                  min={0}
                  max={BYTE_MAX}
                  value={encodeInputs[index]}
                  onChange={(event) => onEncodeChange(index, event.target.value)}
                  aria-label={`Encoded byte ${index + 1} for rocket`}
                />
              </label>
            ))}
          </div>
          {encodeAttempted && !encodeDone ? (
            <Feedback tone="nudge">
              Your three values must satisfy {ROCKET.decimal.toLocaleString("en-US")} = B₁×65,536 + B₂×256 + B₃×1. This is the same base-256 rule you invented earlier.
            </Feedback>
          ) : null}
          {encodeDone ? (
            <Feedback tone="success">
              <div><b>{ROCKET.decimal.toLocaleString("en-US")} → [{ROCKET_BYTES.join(", ")}]</b><span>You solved the rule from number to bytes.</span></div>
            </Feedback>
          ) : null}
        </div>

        <div className={encodeDone ? "card l6-exercise" : "card l6-exercise locked-exercise"}>
          <small>decode</small>
          <h3>Now reverse the exact result you just made. What number do these same bytes reconstruct?</h3>
          <div className="l6-byte-strip">
            {ROCKET_BYTES.map((byte, index) => <code key={index}>{byte}<small>× {WEIGHTS[index].toLocaleString("en-US")}</small></code>)}
          </div>
          <input
            className="l6-code-point-input"
            type="number"
            min={0}
            value={decodeInput}
            onChange={(event) => onDecodeChange(event.target.value)}
            disabled={!encodeDone}
            aria-label="Decoded code point from the same rocket bytes"
            placeholder="reconstructed number"
          />
          {encodeDone && decodeAttempted && !decodeDone ? (
            <Feedback tone="nudge">Use the same equation: 1×65,536 + 246×256 + 128×1.</Feedback>
          ) : null}
          {decodeDone ? (
            <Feedback tone="success">
              <div><b>[{ROCKET_BYTES.join(", ")}] → {ROCKET.decimal.toLocaleString("en-US")}</b><span>The same bytes returned to the same identity.</span></div>
            </Feedback>
          ) : null}
        </div>
      </div>

      {encodeDone && decodeDone ? (
        <>
          <div className="l6-roundtrip-model">
            <strong>{ROCKET.symbol}</strong><span>→</span><code>{ROCKET.notation}</code><span>encode →</span><b>[{ROCKET_BYTES.join(", ")}]</b><span>decode →</span><code>{ROCKET.notation}</code><span>→</span><strong>{ROCKET.symbol}</strong>
          </div>
          <p className="quiet-copy l6-centered-note">Encoding and decoding are not separate tricks. They are opposite directions through the same agreed relationship.</p>
          <button className="primary-button l6-main-action" onClick={onContinue}>Now inspect the cost of our rule →</button>
        </>
      ) : null}
    </div>
  );
}
