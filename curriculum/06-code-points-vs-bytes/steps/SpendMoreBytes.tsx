"use client";

import { Feedback } from "../../../components/ui/Feedback";
import { QuestionPrompt } from "../../../components/ui/QuestionPrompt";
import { ROCKET, TOY_RULE_NAME, TOY_WIDTH } from "../config";
import { BYTE_MAX, byteWeights, isByteValue } from "../encoding";

const WEIGHTS = byteWeights(TOY_WIDTH);

export function SpendMoreBytesStep({
  values,
  onChange,
  onContinue,
}: {
  values: string[];
  onChange: (index: number, value: string) => void;
  onContinue: () => void;
}) {
  const numbers = values.map((value) => Number(value));
  const allValid = values.every((value, index) => value.trim() !== "" && Number.isFinite(numbers[index]) && isByteValue(numbers[index]));
  const outOfRange = values.some((value, index) => value.trim() !== "" && Number.isFinite(numbers[index]) && !isByteValue(numbers[index]));
  const total = allValid ? numbers.reduce((sum, byte, index) => sum + byte * WEIGHTS[index], 0) : null;
  const solved = total === ROCKET.codePoint;
  const difference = total === null ? null : ROCKET.codePoint - total;

  return (
    <div className="screen-layout centered-screen wide-screen l6-screen">
      <QuestionPrompt
        eyebrow="Step 3 · Spend more bytes"
        title={<>Can you build {ROCKET.codePoint.toLocaleString("en-US")} out of three byte positions?</>}
        lead="One byte was too small, so give yourself three. Each position holds 0–255, and each one is worth a fixed amount — exactly like the binary places in Lesson 01, one layer up."
      />

      <div className="l6-build-lab card">
        <div className="l6-build-target">
          <div><small>Target</small><strong>{ROCKET.codePoint.toLocaleString("en-US")}</strong></div>
          <span>→</span>
          <div><small>Your total</small><strong className={solved ? "solved" : ""}>{total === null ? "—" : total.toLocaleString("en-US")}</strong></div>
        </div>

        <div className="l6-build-row">
          {WEIGHTS.map((weight, index) => (
            <label key={weight} className="l6-build-cell">
              <small>worth {weight.toLocaleString("en-US")} each</small>
              <input
                type="number"
                min={0}
                max={BYTE_MAX}
                value={values[index]}
                onChange={(event) => onChange(index, event.target.value)}
                aria-label={`Byte position worth ${weight}`}
              />
              <span>× {weight.toLocaleString("en-US")}</span>
            </label>
          ))}
        </div>

        {allValid ? (
          <div className="l6-build-equation" aria-live="polite">
            {numbers.map((byte, index) => (
              <span key={WEIGHTS[index]}>
                {index > 0 ? <b>+</b> : null}
                {byte.toLocaleString("en-US")} × {WEIGHTS[index].toLocaleString("en-US")}
              </span>
            ))}
            <b>=</b>
            <strong>{total?.toLocaleString("en-US")}</strong>
          </div>
        ) : null}

        {outOfRange ? (
          <Feedback tone="nudge">A byte position only holds 0 through {BYTE_MAX}. Anything larger needs another position.</Feedback>
        ) : null}

        {allValid && !solved && difference !== null ? (
          <p className={difference > 0 ? "l6-hint" : "l6-hint over"}>
            {difference > 0
              ? `You still need ${difference.toLocaleString("en-US")} more.`
              : `You are ${Math.abs(difference).toLocaleString("en-US")} too high.`}
          </p>
        ) : null}
      </div>

      {solved ? (
        <>
          <Feedback tone="success">
            <div>
              <b>You built {ROCKET.codePoint.toLocaleString("en-US")} out of bytes.</b>
              <span>Three positions, each worth 256 times the one to its right. That is positional notation again — base 10 in Lesson 01&apos;s comparison, base 2 for bits, base 256 for bytes.</span>
            </div>
          </Feedback>

          <div className="l6-toy-result">
            <div className="l6-toy-badge">
              <small>Our toy rule</small>
              <strong>{TOY_RULE_NAME}</strong>
              <span>not a real Unicode encoding</span>
            </div>
            <div className="l6-toy-bytes" aria-label={`Rocket encoded as ${numbers.join(", ")}`}>
              <b>{ROCKET.codePoint.toLocaleString("en-US")}</b>
              <span>→</span>
              {numbers.map((byte, index) => <code key={WEIGHTS[index]}>{byte}</code>)}
            </div>
          </div>

          <p className="quiet-copy l6-caveat">
            Read that carefully. We invented <strong>a</strong> way to put this code point into bytes. We have not discovered <strong>the</strong> way.
          </p>

          <button className="primary-button l6-main-action" onClick={onContinue}>Is that byte sequence forced? →</button>
        </>
      ) : null}
    </div>
  );
}
