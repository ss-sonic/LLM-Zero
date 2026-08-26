"use client";

import { Feedback } from "../../../components/ui/Feedback";
import { QuestionPrompt } from "../../../components/ui/QuestionPrompt";
import { CEILING, PAIR_VALUES, SINGLE_UNIT_VALUES } from "../config";
import { assignableCodePoints, toHex } from "../encodings";

/** The debt Lesson 07 left open, paid by arithmetic the learner does themselves. */
export function TheCeilingStep({
  value,
  onChange,
  onContinue,
}: {
  value: string;
  onChange: (value: string) => void;
  onContinue: () => void;
}) {
  const entered = value.trim().toUpperCase().replace(/[\s,_]/g, "");
  const touched = entered !== "";
  const solved = entered === String(CEILING) || entered === `U+${toHex(CEILING, 4)}` || entered === toHex(CEILING, 4);

  return (
    <div className="screen-layout centered-screen wide-screen l8-screen">
      <QuestionPrompt
        eyebrow="Step 5 · The ceiling"
        title="So how high can this encoding count?"
        lead="One unit reaches everything below the reserved blocks. A pair reaches everything above. Add them up and you get a number you have already met."
      />

      <div className="card l8-ceiling-lab">
        <div className="l8-sum">
          <div><small>one unit</small><b>{SINGLE_UNIT_VALUES.toLocaleString("en-US")}</b><span>values</span></div>
          <span className="l8-op">+</span>
          <div><small>a pair</small><b>{PAIR_VALUES.toLocaleString("en-US")}</b><span>values</span></div>
          <span className="l8-op">=</span>
          <div className="l8-sum-total"><small>highest code point</small>
            <input
              className={`l8-input${solved ? " right" : ""}${touched && !solved ? " wrong" : ""}`}
              value={value}
              onChange={(event) => onChange(event.target.value)}
              aria-label="The highest code point this encoding can reach"
              placeholder="?"
            />
          </div>
        </div>

        {touched && !solved && (
          <Feedback tone="nudge">
            Add the two counts, then remember that counting starts at zero — the highest value is one less than the total.
          </Feedback>
        )}
      </div>

      {solved && (
        <>
          <Feedback tone="success">
            <div>
              <b>{CEILING.toLocaleString("en-US")} — U+{toHex(CEILING, 4)}.</b>
              <span>Lesson 07 met this number at the bottom of a four-byte UTF-8 sequence and could not explain it. Now you can.</span>
            </div>
          </Feedback>

          <div className="l8-verdict">
            <div>
              <small>what it is not</small>
              <b>A judgement about how many characters the world needs.</b>
              <span>UTF-8&apos;s four-byte form could reach {(2 ** 21).toLocaleString("en-US")} on its own, and would happily go further with a fifth byte.</span>
            </div>
            <div className="l8-verdict-key">
              <small>what it is</small>
              <b>The size of a compatibility patch.</b>
              <span>Unicode stops here because a 1990s encoding could not widen its unit, and every encoding since has to agree — otherwise text stops round-tripping between them.</span>
            </div>
            <div>
              <small>and it left a hole</small>
              <b>2,048 code points can never be characters.</b>
              <span>{assignableCodePoints().toLocaleString("en-US")} of the {(CEILING + 1).toLocaleString("en-US")} are usable. The reserved blocks are spent permanently, in every encoding, forever.</span>
            </div>
          </div>

          <button className="primary-button l8-main-action" onClick={onContinue}>One more problem with wide units →</button>
        </>
      )}
    </div>
  );
}
