"use client";

import { ChoiceCard } from "../../../components/ui/ChoiceCard";
import { Feedback } from "../../../components/ui/Feedback";
import { WORLD_SYMBOLS } from "../config";
import type { RequirementAnswer } from "../types";

export function WorldSystemStep({
  answer,
  onAnswer,
  onContinue,
}: {
  answer: RequirementAnswer;
  onAnswer: (answer: Exclude<RequirementAnswer, null>) => void;
  onContinue: () => void;
}) {
  return (
    <div className="screen-layout centered-screen wide-screen l5-screen">
      <div className="screen-copy centered-copy compact-copy">
        <p className="eyebrow">Lesson 05 · A system for the world</p>
        <h1>What must a global character system guarantee?</h1>
        <p className="lead">Lesson 04 showed that ASCII&apos;s table is too small. A replacement must handle far more writing systems and symbols without bringing back the disagreement problem.</p>
      </div>

      <div className="l5-world-strip" aria-label="Example characters that a global system may need">
        {WORLD_SYMBOLS.map((symbol) => <span key={symbol}>{symbol}</span>)}
      </div>

      <div className="l5-choice-grid">
        <ChoiceCard variant="large" selected={answer === "local"} onClick={() => onAnswer("local")}>
          <b>Let each computer choose</b>
          <span>Every machine can assign its own numbers to the characters it needs.</span>
        </ChoiceCard>
        <ChoiceCard variant="large" selected={answer === "shared"} onClick={() => onAnswer("shared")}>
          <b>Give entries shared identities</b>
          <span>The same encoded character gets the same agreed numeric identity everywhere.</span>
        </ChoiceCard>
        <ChoiceCard variant="large" selected={answer === "reuse"} onClick={() => onAnswer("reuse")}>
          <b>Reuse numbers by language</b>
          <span>A number can mean one thing in one language and something else in another.</span>
        </ChoiceCard>
      </div>

      {answer === "local" && <Feedback tone="nudge">That recreates Lesson 02: a number only travels safely when both sides already agree on its interpretation.</Feedback>}
      {answer === "reuse" && <Feedback tone="nudge">Then the receiver needs extra context before it can know what the number means. A global agreement should remove that ambiguity.</Feedback>}
      {answer === "shared" && (
        <Feedback tone="success">
          <div><b>Exactly.</b><span>The repertoire can grow enormously, but the agreement principle stays the same: stable shared numeric identities.</span></div>
          <button className="primary-button" onClick={onContinue}>Invent a tiny global table →</button>
        </Feedback>
      )}
    </div>
  );
}
