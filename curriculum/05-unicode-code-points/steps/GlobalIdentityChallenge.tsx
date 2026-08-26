"use client";

import { Feedback } from "../../../components/ui/Feedback";
import { QuestionPrompt } from "../../../components/ui/QuestionPrompt";
import { TextRecall, type RecallAssessment } from "../../../components/ui/TextRecall";
import { ROCKET_EXAMPLE } from "../config";
import { toUnicodeNotation } from "../unicode";

const ASCII_A = 65;

/**
 * Lesson completion as construction plus recall.
 *
 * The earlier version matched five characters against a dropdown containing the
 * five code points shown one screen before, then closed with three cards where
 * one was naive, one overconfident and one carefully worded — passable by reading
 * the question rather than the concept. Here the learner produces a code point
 * from an earlier lesson, and states the identity/storage split in their own words
 * before seeing it.
 */
export function GlobalIdentityChallengeStep({
  asciiInput,
  recallText,
  recallCommitted,
  recallAssessment,
  onAsciiInputChange,
  onRecallChange,
  onRecallCommit,
  onRecallAssess,
  onRecallRewrite,
  onFinish,
}: {
  asciiInput: string;
  recallText: string;
  recallCommitted: boolean;
  recallAssessment: RecallAssessment;
  onAsciiInputChange: (value: string) => void;
  onRecallChange: (value: string) => void;
  onRecallCommit: () => void;
  onRecallAssess: (assessment: Exclude<RecallAssessment, null>) => void;
  onRecallRewrite: () => void;
  onFinish: () => void;
}) {
  const touched = asciiInput.trim() !== "";
  const entered = Number(asciiInput);
  const solved = touched && Number.isInteger(entered) && entered === ASCII_A;

  return (
    <div className="screen-layout centered-screen wide-screen l5-screen">
      <QuestionPrompt
        eyebrow="Step 7 · Prove the identity layer"
        title="Unicode did not renumber the characters ASCII already had."
        lead="Its first 128 code points are exactly ASCII's assignments, deliberately, so existing text stayed valid. That is enough to work out one code point without being told it."
      />

      <div className="card l5-derive-card">
        <div className="l5-derive-given">
          <div><small>Given</small><b>Unicode code points 0–127 = ASCII</b></div>
          <div><small>Wanted</small><b>the code point for A</b></div>
        </div>

        <h3 className="l5-decision-question">Without looking back: which number is it?</h3>
        <div className="l5-derive-entry">
          <span className="l5-derive-symbol">A</span>
          <span>→</span>
          <input
            className={`l5-derive-input${solved ? " right" : ""}${touched && !solved ? " wrong" : ""}`}
            type="number"
            min={0}
            max={1114111}
            value={asciiInput}
            onChange={(event) => onAsciiInputChange(event.target.value)}
            aria-label="Unicode code point for the letter A"
            placeholder="?"
          />
        </div>

        {touched && !solved && (
          <Feedback tone="nudge">
            Not the value ASCII published for A. You encoded a word with it two screens ago — the uppercase run starts there.
          </Feedback>
        )}

        {solved && (
          <div className="l5-derive-result">
            <code>{toUnicodeNotation(ASCII_A)}</code>
            <p>Same character, same number as ASCII, now with a name inside a system that also has room for {ROCKET_EXAMPLE.symbol}.</p>
          </div>
        )}
      </div>

      {solved && (
        <div className="l5-recall-block">
          <h2 className="l5-decision-question">Unicode says {ROCKET_EXAMPLE.symbol} is {ROCKET_EXAMPLE.notation}. What has that settled, and what has it deliberately not?</h2>
          <TextRecall
            label="Commit your answer before the principle appears."
            value={recallText}
            placeholder="Two short sentences are plenty."
            principle="It has settled identity: everyone now agrees which character that number refers to, anywhere in the world. It has not settled storage — the code point does not say how many bytes are used or what those bytes contain. That is a separate rule, and 128640 is far too large for one byte to hold."
            committed={recallCommitted}
            assessment={recallAssessment}
            onChange={onRecallChange}
            onCommit={onRecallCommit}
            onAssess={onRecallAssess}
            onRewrite={onRecallRewrite}
          />

          {recallAssessment !== null && (
            <>
              <Feedback tone="success">
                <div>
                  <b>Identity, not storage.</b>
                  <span>You can now keep &ldquo;which character is this?&rdquo; apart from &ldquo;how does that identity become bytes?&rdquo; — which is the whole of the next lesson.</span>
                </div>
              </Feedback>
              <button className="primary-button l5-main-action" onClick={onFinish}>Complete Lesson 05 →</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
