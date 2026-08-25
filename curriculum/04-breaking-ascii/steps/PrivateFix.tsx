"use client";

import { QuestionPrompt } from "../../../components/ui/QuestionPrompt";
import { TextRecall } from "../../../components/ui/TextRecall";
import type { PrivateFixAnswer } from "../types";

export function PrivateFixStep({
  assigned,
  sent,
  answer,
  recallText,
  onAssign,
  onSend,
  onRecallChange,
  onRecallSubmit,
  onContinue,
}: {
  assigned: boolean;
  sent: boolean;
  answer: PrivateFixAnswer;
  recallText: string;
  onAssign: () => void;
  onSend: () => void;
  onRecallChange: (value: string) => void;
  onRecallSubmit: (value: string) => void;
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
          <h3 className="l4-decision-question">Without looking back: what principle from Lesson 02 is missing here?</h3>
          <TextRecall
            label="Explain why Computer 2 cannot recover é from 200."
            value={recallText}
            placeholder="For example: Computer 2 ..."
            status={answer === "agreement" ? "success" : answer === "needs-work" || answer === "size" || answer === "binary" ? "needs-work" : "idle"}
            nudge="Focus on what the receiver knows. A different numeric value would not fix a rule that exists only on the sender."
            success="A number communicates a character only when both sides share the mapping that gives that number its interpretation."
            onChange={onRecallChange}
            onSubmit={onRecallSubmit}
          />

          {answer === "agreement" ? (
            <button className="primary-button l4-main-action" onClick={onContinue}>See how large the problem is →</button>
          ) : null}
        </div>
      )}
    </div>
  );
}
