"use client";

import { Feedback } from "../../../components/ui/Feedback";
import { QuestionPrompt } from "../../../components/ui/QuestionPrompt";
import { LATIN_A, ROCKET, TOY_RULE_NAME, TOY_WIDTH } from "../config";
import { BYTE_MAX, byteWeights, decodeFixed, encodeFixed } from "../encoding";

const WEIGHTS = byteWeights(TOY_WIDTH);
const TARGET_BYTES = encodeFixed(LATIN_A.codePoint, TOY_WIDTH) ?? [];
const ROCKET_BYTES = encodeFixed(ROCKET.codePoint, TOY_WIDTH) ?? [];

export function EncodeDecodeStep({
  encodeInputs,
  decodeInput,
  onEncodeChange,
  onDecodeChange,
  onFinish,
}: {
  encodeInputs: string[];
  decodeInput: string;
  onEncodeChange: (index: number, value: string) => void;
  onDecodeChange: (value: string) => void;
  onFinish: () => void;
}) {
  const encodeDone = TARGET_BYTES.every((byte, index) => encodeInputs[index].trim() !== "" && Number(encodeInputs[index]) === byte);
  const encodeAttempted = encodeInputs.every((value) => value.trim() !== "");
  const decodeDone = decodeInput.trim() !== "" && Number(decodeInput) === ROCKET.codePoint;
  const decodeAttempted = decodeInput.trim() !== "";

  return (
    <div className="screen-layout centered-screen wide-screen l6-screen">
      <QuestionPrompt
        eyebrow="Step 7 · Both directions"
        title={<>Run {TOY_RULE_NAME} forwards, then backwards.</>}
        lead="An encoding is only useful if it works in both directions. Encode a character into bytes, then take a byte sequence apart to recover the character."
      />

      <div className="l6-exercise card">
        <div className="l6-exercise-head">
          <span className="l6-exercise-tag">Encode</span>
          <h3>Put {LATIN_A.symbol} into bytes. Its code point is {LATIN_A.codePoint}.</h3>
        </div>
        <div className="l6-build-row">
          {WEIGHTS.map((weight, index) => (
            <label key={weight} className="l6-build-cell">
              <small>worth {weight.toLocaleString("en-US")} each</small>
              <input
                type="number"
                min={0}
                max={BYTE_MAX}
                value={encodeInputs[index]}
                onChange={(event) => onEncodeChange(index, event.target.value)}
                aria-label={`Byte position worth ${weight} for the letter A`}
              />
              <span>× {weight.toLocaleString("en-US")}</span>
            </label>
          ))}
        </div>
        {encodeAttempted && !encodeDone ? (
          <Feedback tone="nudge">
            {LATIN_A.codePoint} is smaller than {WEIGHTS[0].toLocaleString("en-US")} and smaller than {WEIGHTS[1]}, so the first two positions have nothing to contribute.
          </Feedback>
        ) : null}
        {encodeDone ? (
          <Feedback tone="success">
            <div>
              <b>{LATIN_A.symbol} → [{TARGET_BYTES.join(", ")}]</b>
              <span>A fixed width means even a tiny value takes the full three positions.</span>
            </div>
          </Feedback>
        ) : null}
      </div>

      {encodeDone ? (
        <div className="l6-exercise card">
          <div className="l6-exercise-head">
            <span className="l6-exercise-tag">Decode</span>
            <h3>Now go the other way. These bytes arrived — which code point are they?</h3>
          </div>

          <div className="l6-decode-strip" aria-label="Bytes to decode">
            {ROCKET_BYTES.map((byte, index) => (
              <div key={index}>
                <code>{byte}</code>
                <small>× {WEIGHTS[index].toLocaleString("en-US")}</small>
              </div>
            ))}
          </div>

          <label className="l6-derive-input">
            <span>Code point</span>
            <input
              type="number"
              min={0}
              value={decodeInput}
              onChange={(event) => onDecodeChange(event.target.value)}
              aria-label="Decoded code point"
            />
          </label>

          {decodeAttempted && !decodeDone ? (
            <Feedback tone="nudge">
              Multiply each byte by the value of its position, then add the three results:
              {" "}{ROCKET_BYTES.map((byte, index) => `${byte} × ${WEIGHTS[index].toLocaleString("en-US")}`).join(" + ")}.
            </Feedback>
          ) : null}

          {decodeDone ? (
            <Feedback tone="success">
              <div>
                <b>{decodeFixed(ROCKET_BYTES).toLocaleString("en-US")} — that is {ROCKET.notation}.</b>
                <span>The bytes never contained a rocket. They contained a number, and the shared rule turned it back into an identity.</span>
              </div>
            </Feedback>
          ) : null}
        </div>
      ) : null}

      {decodeDone ? (
        <>
          <div className="l6-roundtrip" aria-label="Round trip through the encoding">
            <div><small>character</small><strong>{ROCKET.symbol}</strong></div>
            <span>→</span>
            <div><small>code point</small><code>{ROCKET.notation}</code></div>
            <span>→</span>
            <div><small>bytes</small><b>[{ROCKET_BYTES.join(", ")}]</b></div>
            <span>→</span>
            <div><small>code point</small><code>{ROCKET.notation}</code></div>
            <span>→</span>
            <div><small>character</small><strong>{ROCKET.symbol}</strong></div>
          </div>
          <p className="quiet-copy l6-caveat">
            The round trip only closed because both ends used the same rule. That is the whole job of an encoding.
          </p>
          <button className="primary-button l6-main-action" onClick={onFinish}>What does this rule cost? →</button>
        </>
      ) : null}
    </div>
  );
}
