"use client";

import { Feedback } from "../../../components/ui/Feedback";
import { QuestionPrompt } from "../../../components/ui/QuestionPrompt";
import { LATIN_A, ROCKET, TOY_WIDTH } from "../config";
import { BYTE_MAX, byteWeights, encodeFixedWidth } from "../encoding";

const WEIGHTS = byteWeights(TOY_WIDTH);
const A_BYTES = encodeFixedWidth(LATIN_A.decimal, TOY_WIDTH) ?? [];
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
  const encodeDone = A_BYTES.every((byte, index) => encodeInputs[index].trim() !== "" && Number(encodeInputs[index]) === byte);
  const encodeAttempted = encodeInputs.every((value) => value.trim() !== "");
  const decodeDone = decodeInput.trim() !== "" && Number(decodeInput) === ROCKET.decimal;
  const decodeAttempted = decodeInput.trim() !== "";

  return (
    <div className="screen-layout centered-screen wide-screen l6-screen">
      <QuestionPrompt
        eyebrow="Step 7 · Prove the rule works both ways"
        title="Can you encode A, then decode the rocket bytes?"
        lead="A useful encoding is not just a one-way trick. The receiver must be able to reverse the same rule."
      />

      <div className="l6-roundtrip-grid">
        <div className="card l6-exercise">
          <small>encode</small>
          <h3>{LATIN_A.symbol} has code point {LATIN_A.decimal}. Fill the three bytes.</h3>
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
                  aria-label={`Encoded byte ${index + 1} for A`}
                />
              </label>
            ))}
          </div>
          {encodeAttempted && !encodeDone ? <Feedback tone="nudge">65 is smaller than both 65,536 and 256, so those two positions cannot contribute anything.</Feedback> : null}
          {encodeDone ? <Feedback tone="success"><b>A → [{A_BYTES.join(", ")}]</b></Feedback> : null}
        </div>

        <div className={encodeDone ? "card l6-exercise" : "card l6-exercise locked-exercise"}>
          <small>decode</small>
          <h3>These bytes arrived. Which code point do they reconstruct?</h3>
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
            aria-label="Decoded code point from rocket bytes"
            placeholder="code point"
          />
          {encodeDone && decodeAttempted && !decodeDone ? <Feedback tone="nudge">Multiply each byte by its position value, then add the three contributions.</Feedback> : null}
          {decodeDone ? <Feedback tone="success"><div><b>{ROCKET.decimal.toLocaleString("en-US")} = {ROCKET.notation}</b><span>The same rule recovered the same identity.</span></div></Feedback> : null}
        </div>
      </div>

      {encodeDone && decodeDone ? (
        <>
          <div className="l6-roundtrip-model"><strong>{ROCKET.symbol}</strong><span>→</span><code>{ROCKET.notation}</code><span>→</span><b>[{ROCKET_BYTES.join(", ")}]</b><span>→</span><code>{ROCKET.notation}</code><span>→</span><strong>{ROCKET.symbol}</strong></div>
          <button className="primary-button l6-main-action" onClick={onContinue}>Now inspect the cost of our rule →</button>
        </>
      ) : null}
    </div>
  );
}
