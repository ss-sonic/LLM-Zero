"use client";

import { ChoiceCard } from "../../../components/ui/ChoiceCard";
import { Feedback } from "../../../components/ui/Feedback";
import type { ConventionAnswer } from "../types";

export function QuestionRuleStep({
  agreedNumber,
  answer,
  onAnswer,
  onContinue,
}: {
  agreedNumber: number;
  answer: ConventionAnswer;
  onAnswer: (answer: Exclude<ConventionAnswer, null>) => void;
  onContinue: () => void;
}) {
  return (
    <div className="screen-layout centered-screen">
      <div className="screen-copy centered-copy">
        <p className="eyebrow">Step 3 · Question the rule</p>
        <h2>You chose <span className="inline-token">A → {agreedNumber}</span></h2>
        <p className="lead">Is {agreedNumber} somehow naturally connected to the letter A?</p>
      </div>
      <div className="binary-choice-row">
        <ChoiceCard variant="large" selected={answer === "yes"} onClick={() => onAnswer("yes")}>
          <b>Yes</b>
          <span>The number must contain something about A.</span>
        </ChoiceCard>
        <ChoiceCard variant="large" selected={answer === "no"} onClick={() => onAnswer("no")}>
          <b>No</b>
          <span>We simply decided what the number means.</span>
        </ChoiceCard>
      </div>
      {answer === "yes" && (
        <Feedback tone="nudge">Try changing the number in your imagination. Could A have been 7 instead? If yes, the number itself cannot be special.</Feedback>
      )}
      {answer === "no" && (
        <Feedback tone="success">
          <div><b>Exactly.</b><span>The number is an identifier because we agreed to use it that way.</span></div>
          <button className="primary-button" onClick={onContinue}>Now break the agreement →</button>
        </Feedback>
      )}
    </div>
  );
}
