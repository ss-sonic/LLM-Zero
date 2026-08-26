"use client";

import { Feedback } from "../../../components/ui/Feedback";
import { QuestionPrompt } from "../../../components/ui/QuestionPrompt";
import { ASCII_MAX } from "../config";
import { toBinary } from "../utf8";

/**
 * The retrieval this lesson's design depends on.
 *
 * UTF-8's first tag is free only because ASCII stopped at 127 — a fact from
 * Lesson 03 that the learner produces here rather than being handed. Without it
 * the `0xxxxxxx` form looks arbitrary instead of inevitable.
 */
export function FreeBitStep({
  asciiMaxInput,
  leadBit,
  onAsciiMaxChange,
  onLeadBitToggle,
  onContinue,
}: {
  asciiMaxInput: string;
  leadBit: string;
  onAsciiMaxChange: (value: string) => void;
  onLeadBitToggle: () => void;
  onContinue: () => void;
}) {
  const touched = asciiMaxInput.trim() !== "";
  const recalled = Number(asciiMaxInput) === ASCII_MAX;
  // Unset until the learner commits, so the nudge cannot answer the question for them.
  const bitChosen = leadBit !== "";
  const bitSet = leadBit === "1";

  return (
    <div className="screen-layout centered-screen wide-screen l7-screen">
      <QuestionPrompt
        eyebrow="Step 4 · The free bit"
        title="Before inventing anything: how far did ASCII's table go?"
        lead="Every byte has eight bits. Whether any of them are spare depends on a number you already know."
      />

      <div className="card l7-free-bit">
        <div className="l7-recall-line">
          <label htmlFor="ascii-max">Without looking back, the largest value ASCII assigns is</label>
          <input
            id="ascii-max"
            className={`l7-input${recalled ? " right" : ""}${touched && !recalled ? " wrong" : ""}`}
            type="number"
            min={0}
            max={255}
            value={asciiMaxInput}
            onChange={(event) => onAsciiMaxChange(event.target.value)}
            placeholder="?"
          />
        </div>

        {touched && !recalled && (
          <Feedback tone="nudge">
            Not that. ASCII&apos;s published table is 128 values long, and it starts at zero.
          </Feedback>
        )}

        {recalled && (
          <>
            <div className="l7-bit-reveal">
              <div>
                <small>{ASCII_MAX} in eight bits</small>
                <code><span className="l7-spare">0</span>{toBinary(ASCII_MAX, 8).slice(1)}</code>
              </div>
              <div>
                <small>65, the letter A</small>
                <code><span className="l7-spare">0</span>{toBinary(65, 8).slice(1)}</code>
              </div>
              <div>
                <small>32, a space</small>
                <code><span className="l7-spare">0</span>{toBinary(32, 8).slice(1)}</code>
              </div>
            </div>
            <p className="l7-reveal-copy">
              128 values need seven bits. Every ASCII character that has ever been stored in a byte has left the
              eighth bit sitting at <b>0</b>, unused, since 1963.
            </p>
            <div className="l7-claim">
              <code>0xxxxxxx</code>
              <span>one byte, holding an ASCII character — and every ASCII file ever written already obeys it</span>
            </div>

            <div className="l7-second-task">
              <h3 className="l7-decision-question">So what must the first bit of a multi-byte character&apos;s byte be?</h3>
              <div className="l7-bit-toggle">
                <button
                  className={bitSet ? "l7-bit on" : "l7-bit"}
                  onClick={onLeadBitToggle}
                  aria-label={bitChosen ? `First bit, currently ${leadBit}` : "Choose the first bit"}
                >{bitChosen ? leadBit : "?"}</button>
                <code>{bitChosen ? leadBit : "?"}xxxxxxx</code>
              </div>
              {bitChosen && !bitSet && (
                <Feedback tone="nudge">
                  A byte beginning 0 is already spoken for: the receiver reads it as a single ASCII character and moves on.
                  A multi-byte character cannot afford to look like one.
                </Feedback>
              )}
            </div>
          </>
        )}
      </div>

      {recalled && bitSet && (
        <>
          <Feedback tone="success">
            <div>
              <b>One bit now separates two worlds.</b>
              <span>0 means a single ASCII byte. 1 means part of something longer. Nothing has been paid for it, because that bit was never being used.</span>
            </div>
          </Feedback>
          <button className="primary-button l7-main-action" onClick={onContinue}>Sort out the longer ones →</button>
        </>
      )}
    </div>
  );
}
