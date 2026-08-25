"use client";

import { ChoiceCard } from "../../../components/ui/ChoiceCard";
import { Feedback } from "../../../components/ui/Feedback";
import type { ScaleChoice } from "../types";

export function ScaleProblemStep({
  choice,
  onChoice,
  onContinue,
}: {
  choice: ScaleChoice;
  onChoice: (choice: Exclude<ScaleChoice, null>) => void;
  onContinue: () => void;
}) {
  return (
    <div className="screen-layout centered-screen wide-screen l3-screen">
      <div className="screen-copy centered-copy compact-copy">
        <p className="eyebrow">Lesson 03 · Scale the agreement</p>
        <h1>Thousands of computers need to exchange text. How should they all agree on the same table?</h1>
        <p className="lead">In Lesson 02, two computers could copy the same rulebook. Now imagine every manufacturer and every machine inventing its own mapping.</p>
      </div>

      <div className="l3-scale-network" aria-hidden="true">
        {["Maker A", "Maker B", "Maker C", "Maker D", "Maker E"].map((maker, index) => (
          <div className="l3-maker" key={maker}><small>{maker}</small><code>table {index + 1}</code></div>
        ))}
      </div>

      <div className="l3-choice-grid">
        <ChoiceCard variant="large" selected={choice === "pairwise"} onClick={() => onChoice("pairwise")}>
          <b>Negotiate every pair</b>
          <span>Each pair of computers invents a private table before they talk.</span>
        </ChoiceCard>
        <ChoiceCard variant="large" selected={choice === "published"} onClick={() => onChoice("published")}>
          <b>Publish one shared table</b>
          <span>Anyone who wants to communicate implements the same rulebook.</span>
        </ChoiceCard>
        <ChoiceCard variant="large" selected={choice === "guess"} onClick={() => onChoice("guess")}>
          <b>Let receivers guess</b>
          <span>Send numbers and hope every machine interprets them the same way.</span>
        </ChoiceCard>
      </div>

      {choice === "pairwise" && <Feedback tone="nudge">That can work for two machines, but the number of private agreements explodes as more machines join. We need something everyone can know before communication starts.</Feedback>}
      {choice === "guess" && <Feedback tone="nudge">The exact problem from Lesson 02 returns: the same number can mean different symbols. Guessing cannot guarantee communication.</Feedback>}
      {choice === "published" && (
        <Feedback tone="success">
          <div><b>Exactly.</b><span>One published agreement can be implemented by machines that have never met each other. That is the job of a standard.</span></div>
          <button className="primary-button" onClick={onContinue}>Publish a tiny one yourself →</button>
        </Feedback>
      )}
    </div>
  );
}
