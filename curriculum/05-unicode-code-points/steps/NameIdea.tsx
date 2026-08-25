"use client";

import { ChoiceCard } from "../../../components/ui/ChoiceCard";
import { Feedback } from "../../../components/ui/Feedback";
import type { CodePointAnswer } from "../types";

export function NameIdeaStep({
  answer,
  onAnswer,
  onContinue,
}: {
  answer: CodePointAnswer;
  onAnswer: (answer: Exclude<CodePointAnswer, null>) => void;
  onContinue: () => void;
}) {
  return (
    <div className="screen-layout centered-screen wide-screen l5-screen">
      <div className="screen-copy centered-copy compact-copy">
        <p className="eyebrow">Step 3 · Name the idea</p>
        <h2>What did your table actually give each entry?</h2>
        <p className="lead">You did not decide how the number would be stored in memory. You only gave each entry a stable place in the shared numbering system.</p>
      </div>

      <div className="l5-choice-grid">
        <ChoiceCard variant="large" selected={answer === "bytes"} onClick={() => onAnswer("bytes")}>
          <b>Its final bytes</b>
          <span>The number already tells us the exact bits that must be stored.</span>
        </ChoiceCard>
        <ChoiceCard variant="large" selected={answer === "position"} onClick={() => onAnswer("position")}>
          <b>A numeric position</b>
          <span>An agreed value identifies the entry inside the shared character system.</span>
        </ChoiceCard>
        <ChoiceCard variant="large" selected={answer === "picture"} onClick={() => onAnswer("picture")}>
          <b>A picture of the glyph</b>
          <span>The number describes the exact shape that a font must draw.</span>
        </ChoiceCard>
      </div>

      {answer === "bytes" && <Feedback tone="nudge">We have not chosen any storage rule yet. A numeric identity and the bytes used to encode that identity are separate questions.</Feedback>}
      {answer === "picture" && <Feedback tone="nudge">Fonts can draw the same character differently. The shared number identifies the character entry, not one exact visual glyph.</Feedback>}
      {answer === "position" && (
        <>
          <Feedback tone="success">
            <div><b>This idea has a name: code point.</b><span>In Unicode, a code point is a numbered position in the Unicode codespace. When Unicode assigns a character to a position, that value identifies the encoded character.</span></div>
          </Feedback>
          <div className="l5-term-card card">
            <small>New term</small>
            <strong>code point</strong>
            <p>a numeric position in a coded character system</p>
            <span>Important: not every Unicode code point is assigned to a character.</span>
          </div>
          <button className="primary-button l5-main-action" onClick={onContinue}>Meet the real global standard →</button>
        </>
      )}
    </div>
  );
}
