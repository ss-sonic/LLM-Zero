"use client";

import { Feedback } from "../../../components/ui/Feedback";
import { QuestionPrompt } from "../../../components/ui/QuestionPrompt";
import { COST_TEXT, ROCKET, TOY_RULE_NAME, TOY_WIDTH } from "../config";
import { encodeFixed, encodeText } from "../encoding";

const CHARACTERS = Array.from(COST_TEXT);
const STREAM = encodeText(COST_TEXT, TOY_WIDTH);
const TOTAL_BYTES = STREAM.length;
const ZERO_BYTES = STREAM.filter((byte) => byte === 0).length;
const ASCII_BYTES = CHARACTERS.length;

export function CountCostStep({
  totalInput,
  zeroInput,
  onTotalChange,
  onZeroChange,
  onFinish,
}: {
  totalInput: string;
  zeroInput: string;
  onTotalChange: (value: string) => void;
  onZeroChange: (value: string) => void;
  onFinish: () => void;
}) {
  const totalDone = totalInput.trim() !== "" && Number(totalInput) === TOTAL_BYTES;
  const totalAttempted = totalInput.trim() !== "";
  const zeroDone = zeroInput.trim() !== "" && Number(zeroInput) === ZERO_BYTES;
  const zeroAttempted = zeroInput.trim() !== "";

  return (
    <div className="screen-layout centered-screen wide-screen l6-screen">
      <QuestionPrompt
        eyebrow="Step 8 · Count the cost"
        title={<>What does {TOY_RULE_NAME} charge you for “{COST_TEXT}”?</>}
        lead="Every rule has a price. Count this one yourself rather than taking our word for it."
      />

      <div className="l6-cost-grid card" aria-label={`${COST_TEXT} encoded with ${TOY_RULE_NAME}`}>
        {CHARACTERS.map((character) => {
          const bytes = encodeFixed(character.codePointAt(0) ?? 0, TOY_WIDTH) ?? [];
          return (
            <div className="l6-cost-column" key={character}>
              <strong>{character}</strong>
              <small>code point {character.codePointAt(0)}</small>
              <div className="l6-cost-bytes">
                {bytes.map((byte, index) => (
                  <code className={byte === 0 ? "zero" : ""} key={index}>{byte}</code>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="l6-count-row">
        <label className="l6-derive-input">
          <span>Total bytes for “{COST_TEXT}”</span>
          <input
            type="number"
            min={0}
            value={totalInput}
            onChange={(event) => onTotalChange(event.target.value)}
            aria-label={`Total bytes for ${COST_TEXT}`}
          />
        </label>
        <label className="l6-derive-input">
          <span>How many of those are zero?</span>
          <input
            type="number"
            min={0}
            value={zeroInput}
            onChange={(event) => onZeroChange(event.target.value)}
            aria-label="How many of those bytes are zero"
          />
        </label>
      </div>

      {totalAttempted && !totalDone ? (
        <Feedback tone="nudge">Three characters, and {TOY_RULE_NAME} gives every one of them the same number of byte positions.</Feedback>
      ) : null}
      {totalDone && zeroAttempted && !zeroDone ? (
        <Feedback tone="nudge">Count the shaded positions above — the ones holding nothing.</Feedback>
      ) : null}

      {totalDone && zeroDone ? (
        <>
          <Feedback tone="success">
            <div>
              <b>{TOTAL_BYTES} bytes, and {ZERO_BYTES} of them are empty.</b>
              <span>Two thirds of this message is padding that exists only because the rule insists every character be the same size.</span>
            </div>
          </Feedback>

          <div className="l6-cost-compare" aria-label="Storage cost compared with ASCII">
            <div><small>{TOY_RULE_NAME}</small><strong>{TOTAL_BYTES} bytes</strong><span>and it can hold {ROCKET.symbol}</span></div>
            <span>vs</span>
            <div><small>ASCII (Lesson 03)</small><strong>{ASCII_BYTES} bytes</strong><span>but it cannot hold {ROCKET.symbol} at all</span></div>
          </div>

          <div className="l6-open-question card">
            <small>The next engineering problem</small>
            <h3>
              Could one encoding keep ordinary ASCII characters at a single byte, and still have room for {ROCKET.symbol}?
            </h3>
            <p>
              Sit with that for a moment. A fixed width forces you to choose between the two: small enough to be efficient, or large enough to be complete.
              We are not going to answer it yet.
            </p>
          </div>

          <button className="primary-button l6-main-action" onClick={onFinish}>Complete Lesson 06 →</button>
        </>
      ) : null}
    </div>
  );
}
