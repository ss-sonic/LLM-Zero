"use client";

import { Feedback } from "../../../components/ui/Feedback";
import { QuestionPrompt } from "../../../components/ui/QuestionPrompt";
import { HIGH_BLOCK_START, LOW_BLOCK_START, PAIR_VALUES } from "../config";
import { SURROGATE_BLOCK_SIZE, toHex } from "../encodings";

/**
 * The invention screen, and a retrieval of Lesson 07 in a different medium.
 *
 * UTF-8 solved "how do I know where a character ends" by marking bytes with
 * tags. UTF-16 cannot spare any bits inside a unit, so it marks whole units
 * instead — by permanently spending a block of code points that will never be
 * characters. Same idea, paid for differently.
 */
export function ThePatchStep({
  value,
  onChange,
  onContinue,
}: {
  value: string;
  onChange: (value: string) => void;
  onContinue: () => void;
}) {
  const touched = value.trim() !== "";
  const solved = Number(value) === PAIR_VALUES;

  return (
    <div className="screen-layout centered-screen wide-screen l8-screen">
      <QuestionPrompt
        eyebrow="Step 4 · The patch"
        title="You cannot add bits to a unit. So where can the extra information go?"
        lead="Only one place is left: into a second unit. But a reader has to be able to tell a pair from two separate characters — and every value in the range is already somebody's character."
      />

      <div className="card l8-patch">
        <div className="l8-patch-steps">
          <div><small>the move</small><b>Take some values back.</b><span>Reserve a block of code points and promise no character will ever be assigned there.</span></div>
          <div><small>the marking</small><b>Two blocks, not one.</b><span>One block can only ever be the <i>first</i> half of a pair, the other only ever the <i>second</i>. A reader can tell which it is holding from the value alone.</span></div>
          <div><small>the cost</small><b>Those values are gone.</b><span>They are permanently unusable as characters — the price of not being able to widen the unit.</span></div>
        </div>

        <div className="l8-blocks" aria-label="The two reserved blocks">
          <div><small>first halves</small><code>U+{toHex(HIGH_BLOCK_START, 4)} – U+{toHex(HIGH_BLOCK_START + SURROGATE_BLOCK_SIZE - 1, 4)}</code><b>{SURROGATE_BLOCK_SIZE.toLocaleString("en-US")} values</b></div>
          <div><small>second halves</small><code>U+{toHex(LOW_BLOCK_START, 4)} – U+{toHex(LOW_BLOCK_START + SURROGATE_BLOCK_SIZE - 1, 4)}</code><b>{SURROGATE_BLOCK_SIZE.toLocaleString("en-US")} values</b></div>
        </div>

        <div className="l8-patch-question">
          <label htmlFor="pair-values">A pair takes one value from each block. How many characters can that address?</label>
          <input
            id="pair-values"
            className={`l8-input${solved ? " right" : ""}${touched && !solved ? " wrong" : ""}`}
            type="number"
            min={0}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="?"
          />
        </div>

        {touched && !solved && (
          <Feedback tone="nudge">
            Every one of the {SURROGATE_BLOCK_SIZE.toLocaleString("en-US")} first halves can be followed by any of the {SURROGATE_BLOCK_SIZE.toLocaleString("en-US")} second halves.
          </Feedback>
        )}
      </div>

      {solved && (
        <>
          <Feedback tone="success">
            <div>
              <b>{SURROGATE_BLOCK_SIZE.toLocaleString("en-US")} × {SURROGATE_BLOCK_SIZE.toLocaleString("en-US")} = {PAIR_VALUES.toLocaleString("en-US")} more characters.</b>
              <span>
                These pairs are called <b>surrogates</b>. Notice what the trick actually is: a unit that announces its own role
                in a sequence, so a reader is never lost. That is UTF-8&apos;s tagging idea again — but paid for out of the
                character space instead of out of spare bits.
              </span>
            </div>
          </Feedback>
          <button className="primary-button l8-main-action" onClick={onContinue}>Add up what that reaches →</button>
        </>
      )}
    </div>
  );
}
