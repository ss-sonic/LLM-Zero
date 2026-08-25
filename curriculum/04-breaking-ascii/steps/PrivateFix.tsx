"use client";

import { ChoiceCard } from "../../../components/ui/ChoiceCard";
import { Feedback } from "../../../components/ui/Feedback";
import type { PrivateFixAnswer } from "../types";

export function PrivateFixStep({
  assigned,
  sent,
  answer,
  onAssign,
  onSend,
  onAnswer,
  onContinue,
}: {
  assigned: boolean;
  sent: boolean;
  answer: PrivateFixAnswer;
  onAssign: () => void;
  onSend: () => void;
  onAnswer: (answer: Exclude<PrivateFixAnswer, null>) => void;
  onContinue: () => void;
}) {
  return (
    <div className="screen-layout centered-screen wide-screen l4-screen">
      <div className="screen-copy centered-copy compact-copy">
        <p className="eyebrow">Step 3 · Try a private fix</p>
        <h2>Can we just invent é → 200 ourselves?</h2>
        <p className="lead">Computer 1 is free to write down a private rule. The real test is whether Computer 2 can recover the same character.</p>
      </div>

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
          <h3 className="l4-decision-question">Why didn&apos;t this restore communication?</h3>
          <div className="l4-choice-grid">
            <ChoiceCard variant="large" selected={answer === "size"} onClick={() => onAnswer("size")}>
              <b>200 is outside ASCII</b><span>The only issue is that we picked a value larger than 127.</span>
            </ChoiceCard>
            <ChoiceCard variant="large" selected={answer === "agreement"} onClick={() => onAnswer("agreement")}>
              <b>The receiver never agreed</b><span>A private mapping on the sender does not create a shared interpretation.</span>
            </ChoiceCard>
            <ChoiceCard variant="large" selected={answer === "binary"} onClick={() => onAnswer("binary")}>
              <b>Binary cannot hold 200</b><span>The number itself cannot be represented with bits.</span>
            </ChoiceCard>
          </div>

          {answer === "size" && <Feedback tone="nudge">200 is indeed outside ASCII. But choosing a different number still would not make a private rule shared. Computer 2 needs the same published mapping.</Feedback>}
          {answer === "binary" && <Feedback tone="nudge">Bits can represent 200. The problem is interpretation: Computer 2 has no shared rule saying that 200 means é.</Feedback>}
          {answer === "agreement" && (
            <Feedback tone="success">
              <div><b>Exactly.</b><span>We rediscovered Lesson 02: inventing a number locally is not enough. A new character needs a shared assignment that everyone can know.</span></div>
              <button className="primary-button" onClick={onContinue}>See how large the problem is →</button>
            </Feedback>
          )}
        </div>
      )}
    </div>
  );
}
