"use client";

import { Feedback } from "../../../components/ui/Feedback";
import { displayCharacter, isAscii } from "../ascii";
import { MIXED_TEXT } from "../config";
import type { MixedAnswer } from "../types";

const characters = Array.from(MIXED_TEXT);

export function MixedChallengeStep({
  answers,
  onAnswer,
  onFinish,
}: {
  answers: MixedAnswer[];
  onAnswer: (index: number, answer: Exclude<MixedAnswer, null>) => void;
  onFinish: () => void;
}) {
  const answered = characters.every((_, index) => answers[index] !== null && answers[index] !== undefined);
  const correct = answered && characters.every((character, index) => (
    answers[index] === (isAscii(character) ? "ascii" : "outside")
  ));

  return (
    <div className="screen-layout centered-screen wide-screen l4-screen">
      <div className="screen-copy centered-copy compact-copy">
        <p className="eyebrow">Step 6 · Mixed-text challenge</p>
        <h2>Which parts of “Hi café 🚀” can ASCII represent?</h2>
        <p className="lead">Judge each visible symbol separately. A single string can contain both things ASCII knows and things it does not.</p>
      </div>

      <div className="l4-mixed-grid" aria-label="Classify each symbol as ASCII or outside ASCII">
        {characters.map((character, index) => {
          const expected = isAscii(character) ? "ascii" : "outside";
          const chosen = answers[index];
          const wrong = chosen !== null && chosen !== undefined && chosen !== expected;
          return (
            <div className={wrong ? "l4-mixed-card wrong" : "l4-mixed-card"} key={`${character}-${index}`}>
              <strong>{displayCharacter(character)}</strong>
              <div>
                <button className={chosen === "ascii" ? "selected" : ""} onClick={() => onAnswer(index, "ascii")}>ASCII</button>
                <button className={chosen === "outside" ? "selected" : ""} onClick={() => onAnswer(index, "outside")}>Outside</button>
              </div>
            </div>
          );
        })}
      </div>

      {answered && !correct && <Feedback tone="nudge">At least one classification is off. Remember: spaces are ASCII too, while é and 🚀 have no ASCII entries.</Feedback>}
      {correct && (
        <Feedback tone="success">
          <div><b>Exactly.</b><span>ASCII can represent H, i, spaces, c, a, and f here. It cannot represent é or 🚀. The boundary belongs to the table, not to the whole string.</span></div>
          <button className="primary-button" onClick={onFinish}>Finish Lesson 04 →</button>
        </Feedback>
      )}
    </div>
  );
}
