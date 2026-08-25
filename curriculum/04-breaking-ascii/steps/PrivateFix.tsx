"use client";

import { QuestionPrompt } from "../../../components/ui/QuestionPrompt";
import { TextRecall, type RecallAssessment } from "../../../components/ui/TextRecall";

export function PrivateFixStep({
  assigned,
  sent,
  recallText,
  recallCommitted,
  recallAssessment,
  onAssign,
  onSend,
  onRecallChange,
  onRecallCommit,
  onRecallAssess,
  onRecallRewrite,
  onContinue,
}: {
  assigned: boolean;
  sent: boolean;
  recallText: string;
  recallCommitted: boolean;
  recallAssessment: RecallAssessment;
  onAssign: () => void;
  onSend: () => void;
  onRecallChange: (value: string) => void;
  onRecallCommit: () => void;
  onRecallAssess: (assessment: Exclude<RecallAssessment, null>) => void;
  onRecallRewrite: () => void;
  onContinue: () => void;
}) {
  return (
    <div className="screen-layout centered-screen wide-screen l4-screen">
      <QuestionPrompt
        eyebrow="Step 3 · Try a private fix"
        title="Can we just invent é → 200 ourselves?"
        lead="Computer 1 is free to write down a private rule. The real test is whether Computer 2 can recover the same character."
      />

      <div className="l4-private-lab">
        <div className="card l4-machine-card">
          <small>Computer 1 · sender</small>
          <div className="l4-machine-display">é</div>
          <code>{assigned ? "é → 200  (private patch)" : "é → ?"}</code>
        </div>
        <div className="l4-private-wire"><strong>{sent ? "200" : "?"}</strong><span>→</span></div>
        <div className="card l4-machine-card">
          <small>Computer 2 · receiver</small>
          <div className={sent ? "l4-machine-display missing" : "l4-machine-display"}>{sent ? "?" : "…"}</div>
          <code>{sent ? "200 → no shared rule" : "waiting"}</code>
        </div>
      </div>

      {!assigned ? (
        <button className="primary-button l4-main-action" onClick={onAssign}>Invent é → 200 on Computer 1 →</button>
      ) : !sent ? (
        <button className="primary-button l4-main-action" onClick={onSend}>Send 200 to Computer 2 →</button>
      ) : (
        <div className="l4-question-block">
          <h3 className="l4-decision-question">Without looking back: what did Lesson 02 prove about a number travelling between two machines?</h3>
          <TextRecall
            label="Write the principle in your own words."
            value={recallText}
            placeholder="One sentence is enough."
            principle="A number only communicates a character when both machines already share the mapping that gives that number its meaning. A rule written on one side is not an agreement."
            committed={recallCommitted}
            assessment={recallAssessment}
            onChange={onRecallChange}
            onCommit={onRecallCommit}
            onAssess={onRecallAssess}
            onRewrite={onRecallRewrite}
          />

          {recallAssessment !== null ? (
            <button className="primary-button l4-main-action" onClick={onContinue}>See how large the problem is →</button>
          ) : null}
        </div>
      )}
    </div>
  );
}
