"use client";

import { ChoiceCard } from "../../../components/ui/ChoiceCard";
import { Feedback } from "../../../components/ui/Feedback";
import { QuestionPrompt } from "../../../components/ui/QuestionPrompt";
import { ALTERNATE_WIDTH, ROCKET, TOY_WIDTH } from "../config";
import { encodeFixedWidth } from "../encoding";
import type { RuleConclusion } from "../types";

const WIDTHS = [TOY_WIDTH, ALTERNATE_WIDTH] as const;

export function ChangeRuleStep({
  inspectedWidths,
  conclusion,
  onInspect,
  onConclusion,
  onContinue,
}: {
  inspectedWidths: number[];
  conclusion: RuleConclusion;
  onInspect: (width: number) => void;
  onConclusion: (answer: Exclude<RuleConclusion, null>) => void;
  onContinue: () => void;
}) {
  const bothSeen = WIDTHS.every((width) => inspectedWidths.includes(width));

  return (
    <div className="screen-layout centered-screen wide-screen l6-screen">
      <QuestionPrompt
        eyebrow="Step 4 · Change only the rule"
        title="If the code point stays the same, must the bytes stay the same?"
        lead="Keep 🚀 and U+1F680 fixed. Change only how many byte positions our invented rule uses."
      />

      <div className="l6-rule-picker" role="group" aria-label="Storage rules to try">
        {WIDTHS.map((width) => {
          const result = encodeFixedWidth(ROCKET.decimal, width);
          const seen = inspectedWidths.includes(width);
          return (
            <button className={seen ? "l6-rule-card seen" : "l6-rule-card"} key={width} onClick={() => onInspect(width)}>
              <small>{seen ? "✓ tried" : "try this rule"}</small>
              <strong>{width} byte positions</strong>
              <span>{ROCKET.notation}</span>
              <div className="l6-rule-bytes">
                {seen ? result?.map((byte, index) => <code key={`${width}-${index}`}>{byte}</code>) : <b>?</b>}
              </div>
            </button>
          );
        })}
      </div>

      {bothSeen ? (
        <div className="l6-question-block">
          <h2 className="l6-decision-question">Same character. Same code point. Different bytes. What changed?</h2>
          <div className="l6-two-choices">
            <ChoiceCard variant="large" selected={conclusion === "code-point"} onClick={() => onConclusion("code-point")}>
              <b>The code point secretly contains both byte sequences</b>
              <span>The bytes were already inside U+1F680 and we merely exposed them.</span>
            </ChoiceCard>
            <ChoiceCard variant="large" selected={conclusion === "rule"} onClick={() => onConclusion("rule")}>
              <b>The storage rule chose the byte sequence</b>
              <span>Changing the rule changed the bytes while the identity stayed fixed.</span>
            </ChoiceCard>
          </div>
          {conclusion === "code-point" ? <Feedback tone="nudge">If the bytes were forced by the code point, changing only our rule could not have changed them.</Feedback> : null}
          {conclusion === "rule" ? (
            <>
              <Feedback tone="success"><b>Exactly. A code point identifies; a separate rule determines its concrete representation.</b></Feedback>
              <button className="primary-button l6-main-action" onClick={onContinue}>Now let two computers disagree →</button>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
