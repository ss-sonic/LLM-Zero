"use client";

import { Feedback } from "../../../components/ui/Feedback";
import { QuestionPrompt } from "../../../components/ui/QuestionPrompt";
import { PAIN_DIFFERENCE_INDEX, PAIN_SEQUENCE_A, PAIN_SEQUENCE_B } from "../config";

export function BinaryPainStep({ guess, onGuess, onContinue }: { guess: number | null; onGuess: (index: number) => void; onContinue: () => void }) {
  const correct = guess === PAIN_DIFFERENCE_INDEX;
  return (
    <div className="screen-layout centered-screen wide-screen hx-screen">
      <QuestionPrompt
        level="h1"
        eyebrow="Foundation · Hexadecimal"
        title="Which byte changed?"
        lead="Both rows are exact. That does not make them pleasant to inspect. Find the one byte that differs."
      />
      <div className="hx-pain-card card">
        {[PAIN_SEQUENCE_A, PAIN_SEQUENCE_B].map((sequence, row) => (
          <div className="hx-binary-row" key={row}>
            <small>{row === 0 ? "before" : "after"}</small>
            {sequence.map((byte, index) => (
              <button className={guess === index ? (index === PAIN_DIFFERENCE_INDEX ? "correct" : "wrong") : ""} onClick={() => onGuess(index)} key={index} aria-label={`Compare byte ${index + 1}: ${byte}`}>
                {byte}
              </button>
            ))}
          </div>
        ))}
      </div>
      {guess !== null && !correct ? <Feedback tone="nudge">That byte is identical in both rows. Compare the bits in the same position directly underneath each other.</Feedback> : null}
      {correct ? (
        <>
          <Feedback tone="success"><div><b>You found one changed bit.</b><span>Binary is wonderfully precise and surprisingly noisy for human eyes. We want a shorter notation that loses nothing.</span></div></Feedback>
          <button className="primary-button hx-main-action" onClick={onContinue}>Make the groups smaller →</button>
        </>
      ) : null}
    </div>
  );
}
