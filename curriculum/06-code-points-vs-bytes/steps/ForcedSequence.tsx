"use client";

import { ChoiceCard } from "../../../components/ui/ChoiceCard";
import { Feedback } from "../../../components/ui/Feedback";
import { QuestionPrompt } from "../../../components/ui/QuestionPrompt";
import { LATIN_A, ROCKET, WIDTH_OPTIONS } from "../config";
import { encodeFixed, maxValueForWidth } from "../encoding";
import type { ForcedAnswer } from "../types";

export function ForcedSequenceStep({
  widthsSeen,
  answer,
  onInspect,
  onAnswer,
  onContinue,
}: {
  widthsSeen: number[];
  answer: ForcedAnswer;
  onInspect: (width: number) => void;
  onAnswer: (answer: Exclude<ForcedAnswer, null>) => void;
  onContinue: () => void;
}) {
  const allInspected = WIDTH_OPTIONS.every((width) => widthsSeen.includes(width));

  return (
    <div className="screen-layout centered-screen wide-screen l6-screen">
      <QuestionPrompt
        eyebrow="Step 4 · Change the rule"
        title="Was three bytes the only choice?"
        lead="Other designers can pick a different fixed width for the same idea. Run each rule yourself and watch what happens to the very same code point."
      />

      <div className="l6-width-picker" role="group" aria-label="Fixed-width rules to inspect">
        {WIDTH_OPTIONS.map((width) => (
          <button
            key={width}
            className={widthsSeen.includes(width) ? "l6-width-button seen" : "l6-width-button"}
            onClick={() => onInspect(width)}
          >
            <strong>Fixed-{width}</strong>
            <span>{width} bytes per character</span>
            <small>{widthsSeen.includes(width) ? "✓ inspected" : "Inspect rule →"}</small>
          </button>
        ))}
      </div>

      {widthsSeen.length === 0 ? (
        <p className="l6-hint">Inspect all three rules. Their results will appear here.</p>
      ) : (
        <div className="l6-width-results">
          {WIDTH_OPTIONS.filter((width) => widthsSeen.includes(width)).map((width) => {
            const forA = encodeFixed(LATIN_A.codePoint, width);
            const forRocket = encodeFixed(ROCKET.codePoint, width);
            return (
              <article className="l6-width-result-card card" key={width}>
                <div className="l6-width-result-head">
                  <div>
                    <small>Rule</small>
                    <strong>Fixed-{width}</strong>
                  </div>
                  <div>
                    <small>Largest value</small>
                    <b>{maxValueForWidth(width).toLocaleString("en-US")}</b>
                  </div>
                </div>

                <div className="l6-width-examples">
                  <div>
                    <span>{LATIN_A.symbol} · {LATIN_A.codePoint}</span>
                    <code>{forA ? `[${forA.join(", ")}]` : "—"}</code>
                  </div>
                  <div className={!forRocket ? "cannot" : ""}>
                    <span>{ROCKET.symbol} · {ROCKET.codePoint.toLocaleString("en-US")}</span>
                    {forRocket
                      ? <code>[{forRocket.join(", ")}]</code>
                      : <b>no room for this value</b>}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {widthsSeen.includes(2) ? (
        <p className="l6-note l6-width-note">
          Fixed-2 stops at {maxValueForWidth(2).toLocaleString("en-US")}. It handles {LATIN_A.symbol} perfectly well and simply has no room for {ROCKET.symbol} —
          a rule can be valid and still fail to cover the whole repertoire.
        </p>
      ) : null}

      {allInspected ? (
        <div className="l6-question-block">
          <h3 className="l6-decision-question">
            Two rules produced two different byte sequences for {ROCKET.symbol}. What follows from that?
          </h3>
          <div className="l6-choice-grid two-choice">
            <ChoiceCard variant="large" selected={answer === "one-correct"} onClick={() => onAnswer("one-correct")}>
              <b>One of them is right</b>
              <span>{ROCKET.notation} has a true byte sequence, and the other rule produces a wrong one.</span>
            </ChoiceCard>
            <ChoiceCard variant="large" selected={answer === "rule-relative"} onClick={() => onAnswer("rule-relative")}>
              <b>Each is right under its own rule</b>
              <span>The code point does not pick a byte sequence; the rule you apply to it does.</span>
            </ChoiceCard>
          </div>

          {answer === "one-correct" ? (
            <Feedback tone="nudge">
              Then say which one, and why. Both rules recover {ROCKET.codePoint.toLocaleString("en-US")} exactly when you read them back with the rule that produced them.
              Nothing in {ROCKET.notation} itself prefers three bytes over four.
            </Feedback>
          ) : null}

          {answer === "rule-relative" ? (
            <>
              <Feedback tone="success">
                <div>
                  <b>Exactly. The code point alone does not determine the bytes.</b>
                  <span>An identity plus a rule gives a byte sequence. Change the rule and the bytes change while the character stays the same.</span>
                </div>
              </Feedback>
              <button className="primary-button l6-main-action" onClick={onContinue}>
                Then what happens if two machines disagree? →
              </button>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
