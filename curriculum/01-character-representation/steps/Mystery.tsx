"use client";

import { ChoiceCard } from "../../../components/ui/ChoiceCard";

export function MysteryStep({
  introGuess,
  onGuess,
  onContinue,
}: {
  introGuess: string | null;
  onGuess: (guess: string) => void;
  onContinue: () => void;
}) {
  return (
    <div className="screen-layout mystery-screen">
      <div className="screen-copy">
        <p className="eyebrow">The mystery</p>
        <h1>How can the letter <span className="hero-a">A</span> exist inside a computer?</h1>
        <p className="lead">You can see an A. A computer cannot store the shape in the same way your brain sees it. So what do you think is really inside?</p>
      </div>
      <div className="question-card card">
        <p className="question-label">Make a guess. You do not need to know yet.</p>
        <div className="choice-stack">
          {[
            ["picture", "A tiny picture of the letter"],
            ["number", "A number or pattern of 0s and 1s"],
            ["meaning", "The computer somehow understands what A means"],
          ].map(([value, label]) => (
            <ChoiceCard key={value} selected={introGuess === value} onClick={() => onGuess(value)}>
              <span>{label}</span>
            </ChoiceCard>
          ))}
        </div>
        {introGuess && (
          <div className="reveal-panel">
            <b>Good. Keep that guess in your head.</b>
            <span>We are going to build the answer ourselves instead of memorizing it.</span>
            <button className="primary-button" onClick={onContinue}>Build the bridge →</button>
          </div>
        )}
      </div>
    </div>
  );
}
