"use client";

import { ChoiceCard } from "../../../components/ui/ChoiceCard";
import { Feedback } from "../../../components/ui/Feedback";
import { asciiValue } from "../ascii";
import type { MissingAnswer } from "../types";

const asciiWord = "cafe";
const brokenWord = "café";

export function MissingCharacterStep({
  tried,
  answer,
  onTry,
  onAnswer,
  onContinue,
}: {
  tried: boolean;
  answer: MissingAnswer;
  onTry: () => void;
  onAnswer: (answer: Exclude<MissingAnswer, null>) => void;
  onContinue: () => void;
}) {
  return (
    <div className="screen-layout centered-screen wide-screen l4-screen">
      <div className="screen-copy centered-copy compact-copy">
        <p className="eyebrow">Step 2 · One missing character</p>
        <h2>What should ASCII send for é?</h2>
        <p className="lead"><strong>cafe</strong> fits in ASCII. Change only the last character to make <strong>café</strong>, then try the same lookup.</p>
      </div>

      <div className="l4-word-compare">
        <div className="card l4-word-card">
          <small>Works</small><strong>{asciiWord}</strong>
          <code>99 · 97 · 102 · 101</code>
        </div>
        <div className={tried ? "card l4-word-card broken" : "card l4-word-card"}>
          <small>Try this</small><strong>{brokenWord}</strong>
          {!tried ? <span>look up the values</span> : <code>99 · 97 · 102 · ?</code>}
        </div>
      </div>

      {!tried ? (
        <button className="primary-button l4-main-action" onClick={onTry}>Look up café in ASCII →</button>
      ) : (
        <>
          <div className="l4-lookup-row" aria-label="ASCII lookup for café">
            {Array.from(brokenWord).map((character) => {
              const value = asciiValue(character);
              return <div className={value === null ? "missing" : ""} key={character}><b>{character}</b><span>→</span><code>{value ?? "no entry"}</code></div>;
            })}
          </div>

          <div className="l4-question-block">
            <h3 className="l4-decision-question">What actually failed?</h3>
            <div className="l4-choice-grid">
              <ChoiceCard variant="large" selected={answer === "hidden"} onClick={() => onAnswer("hidden")}>
                <b>ASCII hides the value</b><span>There must be another ASCII number for é somewhere else.</span>
              </ChoiceCard>
              <ChoiceCard variant="large" selected={answer === "missing"} onClick={() => onAnswer("missing")}>
                <b>ASCII has no entry for é</b><span>The shared table simply does not assign this character an ASCII value.</span>
              </ChoiceCard>
              <ChoiceCard variant="large" selected={answer === "binary"} onClick={() => onAnswer("binary")}>
                <b>Binary stopped working</b><span>The 0s and 1s can no longer represent numbers.</span>
              </ChoiceCard>
            </div>
          </div>

          {answer === "hidden" && <Feedback tone="nudge">ASCII&apos;s values run only from 0 through 127. There is no second hidden ASCII section containing é.</Feedback>}
          {answer === "binary" && <Feedback tone="nudge">Binary can represent many numbers. The failure happened earlier: ASCII never assigned é a number in its table.</Feedback>}
          {answer === "missing" && (
            <Feedback tone="success">
              <div><b>Exactly.</b><span>A shared table can only represent characters that have entries inside that table.</span></div>
              <button className="primary-button" onClick={onContinue}>Invent a fix →</button>
            </Feedback>
          )}
        </>
      )}
    </div>
  );
}
