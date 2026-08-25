"use client";

import { QuestionPrompt } from "../../../components/ui/QuestionPrompt";
import { TextRecall, type RecallAssessment } from "../../../components/ui/TextRecall";
import { ROCKET } from "../config";

export function ResumePipelineStep({
  recallText,
  recallCommitted,
  recallAssessment,
  onRecallChange,
  onRecallCommit,
  onRecallAssess,
  onRecallRewrite,
  onContinue,
}: {
  recallText: string;
  recallCommitted: boolean;
  recallAssessment: RecallAssessment;
  onRecallChange: (value: string) => void;
  onRecallCommit: () => void;
  onRecallAssess: (assessment: Exclude<RecallAssessment, null>) => void;
  onRecallRewrite: () => void;
  onContinue: () => void;
}) {
  return (
    <div className="screen-layout centered-screen wide-screen l6-screen">
      <QuestionPrompt
        level="h1"
        eyebrow="Lesson 06 · Identity is not storage"
        title={<>{ROCKET.symbol} is {ROCKET.notation}. What actually goes into memory?</>}
        lead="Lesson 05 ended one step short. We can name this character exactly, and we still cannot say what a computer stores for it."
      />

      <div className="l6-open-pipeline" aria-label="Unresolved storage pipeline">
        <div><small>Visible character</small><strong>{ROCKET.symbol}</strong></div>
        <span>→</span>
        <div><small>Unicode code point</small><code>{ROCKET.notation}</code><b>{ROCKET.codePoint.toLocaleString("en-US")}</b></div>
        <span>→</span>
        <div className="unresolved"><small>Bytes in memory</small><strong>???</strong><span>this lesson</span></div>
      </div>

      <div className="l6-question-block">
        <h2 className="l6-decision-question">Without looking back: what did Unicode solve?</h2>
        <TextRecall
          label="Write it in your own words."
          value={recallText}
          placeholder="One sentence is enough."
          principle="Unicode gives each encoded character a stable numeric identity — a code point — that everyone agrees on. It settles which character we mean. It does not settle how that character is stored."
          committed={recallCommitted}
          assessment={recallAssessment}
          onChange={onRecallChange}
          onCommit={onRecallCommit}
          onAssess={onRecallAssess}
          onRewrite={onRecallRewrite}
        />

        {recallAssessment !== null ? (
          <button className="primary-button l6-main-action" onClick={onContinue}>
            So what can one byte actually hold? →
          </button>
        ) : null}
      </div>
    </div>
  );
}
