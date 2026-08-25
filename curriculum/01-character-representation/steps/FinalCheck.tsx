"use client";

import { ChoiceCard } from "../../../components/ui/ChoiceCard";
import { Feedback } from "../../../components/ui/Feedback";
import type { FinalAnswer } from "../types";

export function FinalCheckStep({
  answer,
  onAnswer,
  onContinue,
}: {
  answer: FinalAnswer;
  onAnswer: (answer: Exclude<FinalAnswer, null>) => void;
  onContinue: () => void;
}) {
  return (
    <div className="screen-layout centered-screen">
      <div className="screen-copy centered-copy">
        <p className="eyebrow">Final check</p>
        <h2>So does the computer literally store the letter A?</h2>
        <p className="lead">Choose the statement that matches what you just discovered.</p>
      </div>
      <div className="final-choices">
        <ChoiceCard variant="large" selected={answer === "letter"} onClick={() => onAnswer("letter")}>
          <b>Yes</b>
          <span>Somewhere inside memory there is an actual A.</span>
        </ChoiceCard>
        <ChoiceCard variant="large" selected={answer === "representation"} onClick={() => onAnswer("representation")}>
          <b>No</b>
          <span>It stores a representation that our rules tell us to interpret as A.</span>
        </ChoiceCard>
      </div>
      {answer === "letter" && (
        <Feedback tone="nudge">Remember what traveled between the two computers: only a number. The meaning came from the rule used to interpret it.</Feedback>
      )}
      {answer === "representation" && (
        <Feedback tone="success">
          <div><b>That is the idea.</b><span>You have the first building block.</span></div>
          <button className="primary-button" onClick={onContinue}>Finish lesson →</button>
        </Feedback>
      )}
    </div>
  );
}
