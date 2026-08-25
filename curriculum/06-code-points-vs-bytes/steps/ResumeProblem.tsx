"use client";

import { QuestionPrompt } from "../../../components/ui/QuestionPrompt";
import { TextRecall, type RecallAssessment } from "../../../components/ui/TextRecall";
import { ROCKET } from "../config";

export function ResumeProblemStep({
  recallText,
  committed,
  assessment,
  onChange,
  onCommit,
  onAssess,
  onRewrite,
  onContinue,
}: {
  recallText: string;
  committed: boolean;
  assessment: RecallAssessment;
  onChange: (value: string) => void;
  onCommit: () => void;
  onAssess: (assessment: Exclude<RecallAssessment, null>) => void;
  onRewrite: () => void;
  onContinue: () => void;
}) {
  return (
    <div className="screen-layout centered-screen wide-screen l6-screen">
      <QuestionPrompt
        level="h1"
        eyebrow="Lesson 06 · Identity is not storage"
        title={<>{ROCKET.symbol} is {ROCKET.notation}. What actually goes into memory?</>}
        lead="We ended Lesson 05 with an identity, not a storage format. Keep those two problems separate."
      />

      <div className="l6-pipeline" aria-label="Character to code point to unresolved bytes">
        <div><small>character</small><strong>{ROCKET.symbol}</strong></div>
        <span>→</span>
        <div><small>Unicode identity</small><code>{ROCKET.notation}</code><b>{ROCKET.decimal.toLocaleString("en-US")}</b></div>
        <span>→</span>
        <div className="unresolved"><small>bytes</small><strong>?</strong><b>not decided yet</b></div>
      </div>

      <div className="l6-recall-block">
        <h2 className="l6-decision-question">Without looking back, what did Unicode actually solve?</h2>
        <TextRecall
          label="Explain the result of Lesson 05 in one sentence."
          value={recallText}
          placeholder="Write the idea, not a definition you memorized."
          principle="Unicode gives encoded characters stable shared numeric identities called code points. It settles which identity we mean; it does not by itself settle the bytes used to store that identity."
          committed={committed}
          assessment={assessment}
          onChange={onChange}
          onCommit={onCommit}
          onAssess={onAssess}
          onRewrite={onRewrite}
        />
        {assessment !== null ? (
          <button className="primary-button l6-main-action" onClick={onContinue}>Find the limit of one byte →</button>
        ) : null}
      </div>
    </div>
  );
}
