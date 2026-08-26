"use client";

import { ChoiceCard } from "../../../components/ui/ChoiceCard";
import { Feedback } from "../../../components/ui/Feedback";
import { QuestionPrompt } from "../../../components/ui/QuestionPrompt";
import type { BetChoice } from "../types";

/**
 * A prediction with no careful option.
 *
 * Both bets were genuinely reasonable in 1991 and both were actually built, so a
 * learner cannot pass this by picking the nuanced-sounding card. The point is to
 * own a choice before finding out what the next thirty years did to it.
 */
export function MakeTheBetStep({
  choice,
  onChoose,
  onContinue,
}: {
  choice: BetChoice;
  onChoose: (choice: Exclude<BetChoice, null>) => void;
  onContinue: () => void;
}) {
  return (
    <div className="screen-layout centered-screen wide-screen l8-screen">
      <QuestionPrompt
        level="h1"
        eyebrow="Step 1 · 1991"
        title="Every character in the world fits in 65,536 slots. How wide do you make a unit?"
        lead="You are designing the encoding, before UTF-8 exists. Memory is the scarce resource and fixed width is the obvious shape: one unit per character, so the tenth character sits at position ten."
      />

      <div className="l8-bet-grid">
        <ChoiceCard variant="large" selected={choice === "compact"} onClick={() => onChoose("compact")}>
          <b>Two bytes each</b>
          <span>65,536 slots — everything anyone has catalogued, with room to spare. Half the memory of the alternative.</span>
        </ChoiceCard>
        <ChoiceCard variant="large" selected={choice === "roomy"} onClick={() => onChoose("roomy")}>
          <b>Four bytes each</b>
          <span>Over four billion slots. It can never overflow, whatever gets added later — and it doubles every document, or quadruples plain English.</span>
        </ChoiceCard>
      </div>

      {choice === "compact" && (
        <Feedback tone="success">
          <div>
            <b>That is the bet the industry took.</b>
            <span>Windows, Java and JavaScript were all built on a fixed 16-bit character. It was the reasonable call with the information available.</span>
          </div>
        </Feedback>
      )}

      {choice === "roomy" && (
        <Feedback tone="success">
          <div>
            <b>You would have been right about the future.</b>
            <span>This encoding exists too. Almost nobody chose it for storage, because paying four bytes for the letter A was not affordable in 1991 — and mostly still is not.</span>
          </div>
        </Feedback>
      )}

      {choice !== null && (
        <>
          <div className="l8-named">
            <div><small>two bytes, fixed</small><b>UTF-16</b><span>as it was then: one unit, one character, no exceptions</span></div>
            <div><small>four bytes, fixed</small><b>UTF-32</b><span>one unit, one character, with room that could not run out</span></div>
          </div>
          <button className="primary-button l8-main-action" onClick={onContinue}>See what fixed width buys →</button>
        </>
      )}
    </div>
  );
}
