"use client";

import { ChoiceCard } from "../../../components/ui/ChoiceCard";
import { Feedback } from "../../../components/ui/Feedback";
import { EXPANSION_AREAS } from "../config";
import type { BiggerAnswer } from "../types";

export function BiggerTableStep({
  includedAreas,
  answer,
  onToggleArea,
  onAnswer,
  onContinue,
}: {
  includedAreas: string[];
  answer: BiggerAnswer;
  onToggleArea: (area: string) => void;
  onAnswer: (answer: Exclude<BiggerAnswer, null>) => void;
  onContinue: () => void;
}) {
  const ready = new Set(includedAreas).size >= 4;

  return (
    <div className="screen-layout centered-screen wide-screen l4-screen">
      <div className="screen-copy centered-copy compact-copy">
        <p className="eyebrow">Step 5 · Expand the idea</p>
        <h2>Why not just make the table much bigger?</h2>
        <p className="lead">That instinct is useful. Start adding the kinds of characters a global text system would need to give stable identities.</p>
      </div>

      <div className="l4-expansion-grid">
        {EXPANSION_AREAS.map((area) => {
          const included = includedAreas.includes(area);
          return (
            <button className={included ? "l4-expansion-card included" : "l4-expansion-card"} key={area} onClick={() => onToggleArea(area)}>
              <span>{included ? "✓ Included" : "+ Include"}</span><b>{area}</b>
            </button>
          );
        })}
      </div>

      <div className="l4-expansion-meter"><span>Character groups considered</span><strong>{includedAreas.length} / {EXPANSION_AREAS.length}</strong></div>

      {ready && (
        <div className="l4-question-block">
          <h3 className="l4-decision-question">Which design survives as the repertoire keeps growing?</h3>
          <div className="l4-choice-grid">
            <ChoiceCard variant="large" selected={answer === "private"} onClick={() => onAnswer("private")}>
              <b>Many private regional tables</b><span>Different systems can reuse the same numbers for different characters.</span>
            </ChoiceCard>
            <ChoiceCard variant="large" selected={answer === "shared"} onClick={() => onAnswer("shared")}>
              <b>One much larger shared repertoire</b><span>Give the needed characters distinct identities under one common agreement.</span>
            </ChoiceCard>
            <ChoiceCard variant="large" selected={answer === "guess"} onClick={() => onAnswer("guess")}>
              <b>Let receivers infer the language</b><span>The same number can change meaning depending on what the receiver guesses.</span>
            </ChoiceCard>
          </div>

          {answer === "private" && <Feedback tone="nudge">That recreates the disagreement problem from Lesson 02. A number cannot have a stable interpretation if different tables reuse it differently.</Feedback>}
          {answer === "guess" && <Feedback tone="nudge">Guessing the language does not make the numeric identities stable. Communication needs an agreement, not inference.</Feedback>}
          {answer === "shared" && (
            <Feedback tone="success">
              <div><b>That is the new requirement.</b><span>We need a shared character system with room for far more than ASCII&apos;s small repertoire. We still have not decided how such a system should identify those characters.</span></div>
              <button className="primary-button" onClick={onContinue}>Prove you can spot ASCII&apos;s boundary →</button>
            </Feedback>
          )}
        </div>
      )}
    </div>
  );
}
