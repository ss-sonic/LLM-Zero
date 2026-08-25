"use client";

import { QuestionPrompt } from "../../../components/ui/QuestionPrompt";
import { TextRecall, type RecallAssessment } from "../../../components/ui/TextRecall";
import { ALTERNATE_WIDTH, ROCKET, TOY_WIDTH } from "../config";
import { encodeFixedWidth } from "../encoding";

const SENT_BYTES = encodeFixedWidth(ROCKET.decimal, TOY_WIDTH) ?? [];

export function BreakAgreementStep({
  sent,
  recallText,
  committed,
  assessment,
  onSend,
  onChange,
  onCommit,
  onAssess,
  onRewrite,
  onContinue,
}: {
  sent: boolean;
  recallText: string;
  committed: boolean;
  assessment: RecallAssessment;
  onSend: () => void;
  onChange: (value: string) => void;
  onCommit: () => void;
  onAssess: (assessment: Exclude<RecallAssessment, null>) => void;
  onRewrite: () => void;
  onContinue: () => void;
}) {
  return (
    <div className="screen-layout centered-screen wide-screen l6-screen">
      <QuestionPrompt
        eyebrow="Step 5 · Break the agreement"
        title="What if the sender uses three positions but the receiver expects four?"
        lead="The sender and receiver both know Unicode. The only disagreement is how to read the bytes."
      />

      <div className="l6-wire-lab">
        <div className="card l6-machine">
          <small>sender</small>
          <strong>{ROCKET.symbol}</strong>
          <code>{ROCKET.notation}</code>
          <span>uses {TOY_WIDTH} byte positions</span>
        </div>
        <div className="l6-wire">
          <div className="l6-wire-bytes">
            {sent ? SENT_BYTES.map((byte, index) => <code key={index}>{byte}</code>) : <span>bytes waiting</span>}
          </div>
          <small>{sent ? "exactly three bytes arrived" : "nothing sent yet"}</small>
        </div>
        <div className="card l6-machine">
          <small>receiver</small>
          <strong>{sent ? "…" : "?"}</strong>
          <code>{sent ? "waiting for byte 4" : "waiting"}</code>
          <span>expects {ALTERNATE_WIDTH} byte positions</span>
        </div>
      </div>

      {!sent ? <button className="primary-button l6-main-action" onClick={onSend}>Send the three bytes →</button> : (
        <div className="l6-recall-block">
          <h2 className="l6-decision-question">This failure has an old shape. What principle from an earlier lesson explains it?</h2>
          <TextRecall
            label="Name the principle in your own words."
            value={recallText}
            placeholder="Think about what sender and receiver must share before communication works."
            principle="A transmitted value only has the intended meaning when sender and receiver share the same interpretation rule. Here they received the same bytes but disagreed about how those bytes were grouped into a stored value."
            committed={committed}
            assessment={assessment}
            onChange={onChange}
            onCommit={onCommit}
            onAssess={onAssess}
            onRewrite={onRewrite}
          />
          {assessment !== null ? (
            <>
              <div className="l6-echo">
                <div><small>Lesson 02</small><b>Shared numbers needed a shared character table.</b></div>
                <div><small>Lesson 06</small><b>Shared bytes need a shared rule for reading them.</b></div>
              </div>
              <button className="primary-button l6-main-action" onClick={onContinue}>Give that byte rule a name →</button>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}
