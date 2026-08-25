"use client";

import type { RecallAssessment } from "../../../components/ui/TextRecall";
import { TextRecall } from "../../../components/ui/TextRecall";
import { QuestionPrompt } from "../../../components/ui/QuestionPrompt";

export function PrefixRecallStep({ value, committed, assessment, onChange, onCommit, onAssess, onRewrite, onContinue }: { value: string; committed: boolean; assessment: RecallAssessment; onChange: (value: string) => void; onCommit: () => void; onAssess: (assessment: Exclude<RecallAssessment, null>) => void; onRewrite: () => void; onContinue: () => void }) {
  return (
    <div className="screen-layout centered-screen wide-screen u8-screen">
      <QuestionPrompt eyebrow="Step 10 · Retrieve the design idea" title="Variable length saved space. What problem do UTF-8's leading bit patterns solve?" lead="Answer from the mechanism you just used, not from vocabulary." />
      <div className="u8-prefix-reminder card" aria-label="UTF-8 leading bit patterns"><code>0xxxxxxx</code><code>110xxxxx 10xxxxxx</code><code>1110xxxx 10xxxxxx 10xxxxxx</code><code>11110xxx 10xxxxxx 10xxxxxx 10xxxxxx</code></div>
      <div className="u8-recall-wrap">
        <TextRecall
          label="Explain what the fixed prefix bits let a decoder know."
          value={value}
          placeholder="Write one sentence from memory."
          principle={<>The first byte signals how many bytes belong to the UTF-8 sequence, while bytes beginning with <code>10</code> are recognizable continuation bytes. Those structural patterns let a decoder find sequence boundaries while the remaining bits carry the code-point payload.</>}
          committed={committed}
          assessment={assessment}
          onChange={onChange}
          onCommit={onCommit}
          onAssess={onAssess}
          onRewrite={onRewrite}
        />
      </div>
      {assessment !== null ? <button className="primary-button u8-main-action" onClick={onContinue}>Finish Lesson 07 →</button> : null}
    </div>
  );
}
