"use client";

import { ChoiceCard } from "../../../components/ui/ChoiceCard";
import { Feedback } from "../../../components/ui/Feedback";
import { UNICODE_EXAMPLES } from "../config";
import { toUnicodeNotation } from "../unicode";
import type { ChallengeMatches, FinalConceptAnswer } from "../types";

export function GlobalIdentityChallengeStep({
  matches,
  finalAnswer,
  onMatch,
  onFinalAnswer,
  onFinish,
}: {
  matches: ChallengeMatches;
  finalAnswer: FinalConceptAnswer;
  onMatch: (index: number, value: string) => void;
  onFinalAnswer: (answer: Exclude<FinalConceptAnswer, null>) => void;
  onFinish: () => void;
}) {
  const allSelected = matches.every((value) => value !== null);
  const allCorrect = UNICODE_EXAMPLES.every((example, index) => matches[index] === toUnicodeNotation(example.decimal));

  return (
    <div className="screen-layout centered-screen wide-screen l5-screen">
      <div className="screen-copy centered-copy compact-copy">
        <p className="eyebrow">Step 7 · Global identity challenge</p>
        <h2>Can you match each character to its Unicode identity?</h2>
        <p className="lead">Use the real assignments you inspected. You are matching character identities—not choosing how they are stored.</p>
      </div>

      <div className="l5-match-card card">
        {UNICODE_EXAMPLES.map((example, index) => (
          <label className="l5-match-row" key={example.id}>
            <span className="l5-match-symbol">{example.symbol}</span>
            <span>→</span>
            <select
              value={matches[index] ?? ""}
              onChange={(event) => onMatch(index, event.target.value)}
              aria-label={`Unicode code point for ${example.symbol}`}
            >
              <option value="" disabled>Choose code point</option>
              {UNICODE_EXAMPLES.map((option) => {
                const notation = toUnicodeNotation(option.decimal);
                return <option value={notation} key={notation}>{notation}</option>;
              })}
            </select>
            <small>{example.name}</small>
          </label>
        ))}

        {allSelected && !allCorrect && <p className="l5-error">At least one identity is mismatched. Revisit the assignments before moving on.</p>}
        {allCorrect && <div className="feedback success-feedback l5-inline-success"><div><b>All five identities match.</b><span>The same standard can name characters from very different parts of the repertoire.</span></div></div>}
      </div>

      {allCorrect && (
        <div className="l5-final-question">
          <h3 className="l5-decision-question">What has Unicode solved at this point?</h3>
          <div className="l5-choice-grid">
            <ChoiceCard variant="large" selected={finalAnswer === "bytes"} onClick={() => onFinalAnswer("bytes")}>
              <b>The final bytes</b><span>Every code point directly specifies its stored byte sequence.</span>
            </ChoiceCard>
            <ChoiceCard variant="large" selected={finalAnswer === "identity"} onClick={() => onFinalAnswer("identity")}>
              <b>Shared character identity</b><span>We can agree which encoded character a code point refers to.</span>
            </ChoiceCard>
            <ChoiceCard variant="large" selected={finalAnswer === "size"} onClick={() => onFinalAnswer("size")}>
              <b>One fixed storage size</b><span>Every Unicode character now takes the same amount of memory.</span>
            </ChoiceCard>
          </div>

          {finalAnswer === "bytes" && <Feedback tone="nudge">That is the next problem. The code point names the Unicode position; an encoding still has to map that identity to code units and bytes.</Feedback>}
          {finalAnswer === "size" && <Feedback tone="nudge">Unicode identity does not require every character to use one fixed amount of storage. Storage belongs to the encoding layer we have not built yet.</Feedback>}
          {finalAnswer === "identity" && (
            <Feedback tone="success">
              <div><b>Exactly: identity.</b><span>You can now distinguish “which character is this?” from “how is that identity encoded in memory?”</span></div>
              <button className="primary-button" onClick={onFinish}>Complete Lesson 05 →</button>
            </Feedback>
          )}
        </div>
      )}
    </div>
  );
}
