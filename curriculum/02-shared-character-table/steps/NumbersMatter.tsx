"use client";

import { QuestionPrompt } from "../../../components/ui/QuestionPrompt";
import { TextRecall, type RecallAssessment } from "../../../components/ui/TextRecall";
import { WEIRD_SHARED_TABLE } from "../config";
import type { MappingTable } from "../types";

/**
 * Lesson 02's honest retrieval.
 *
 * The weird-table experiment re-creates the exact situation Lesson 01 ended on, so
 * instead of offering "the number is special" against "both sides agreed" — where
 * the second card is obviously the careful one — the learner has to produce the
 * earlier principle themselves and only then see it.
 */
export function NumbersMatterStep({
  table,
  weirdApplied,
  tested,
  recallText,
  recallCommitted,
  recallAssessment,
  onMakeWeird,
  onTest,
  onRecallChange,
  onRecallCommit,
  onRecallAssess,
  onRecallRewrite,
  onContinue,
}: {
  table: MappingTable;
  weirdApplied: boolean;
  tested: boolean;
  recallText: string;
  recallCommitted: boolean;
  recallAssessment: RecallAssessment;
  onMakeWeird: () => void;
  onTest: () => void;
  onRecallChange: (value: string) => void;
  onRecallCommit: () => void;
  onRecallAssess: (assessment: Exclude<RecallAssessment, null>) => void;
  onRecallRewrite: () => void;
  onContinue: () => void;
}) {
  return (
    <div className="screen-layout centered-screen wide-screen l2-screen">
      <QuestionPrompt
        eyebrow="Step 5 · Question the numbers"
        title="Does A need a sensible-looking number?"
        lead="Your shared table worked. Now replace it with deliberately strange values and test whether communication survives."
      />

      <div className="l2-weird-lab card">
        <div className="l2-current-table">
          {(["A", "B", "C"] as const).map((symbol) => <code key={symbol}>{symbol} → {table[symbol]}</code>)}
        </div>
        {!weirdApplied ? (
          <button className="primary-button" onClick={onMakeWeird}>Make the table weird →</button>
        ) : (
          <>
            <p>Both computers now use <strong>A → {WEIRD_SHARED_TABLE.A}, B → {WEIRD_SHARED_TABLE.B}, C → {WEIRD_SHARED_TABLE.C}</strong>.</p>
            {!tested ? (
              <button className="primary-button" onClick={onTest}>Send B as {WEIRD_SHARED_TABLE.B}</button>
            ) : (
              <div className="l2-weird-result"><span>{WEIRD_SHARED_TABLE.B}</span><b>→</b><strong>B ✓</strong></div>
            )}
          </>
        )}
      </div>

      {tested && (
        <div className="l2-question-block">
          <h2 className="l2-decision-question">Without looking back at Lesson 01: why did a table this strange still work?</h2>
          <TextRecall
            label="Write your explanation before the answer appears."
            value={recallText}
            placeholder="One sentence is enough."
            principle="The number is only an identifier we assigned. Nothing about the character is stored inside it, so even absurd values work — as long as the sender and the receiver interpret them with the same table."
            committed={recallCommitted}
            assessment={recallAssessment}
            onChange={onRecallChange}
            onCommit={onRecallCommit}
            onAssess={onRecallAssess}
            onRewrite={onRecallRewrite}
          />

          {recallAssessment !== null && (
            <>
              <div className="l2-recall-echo">
                <div><small>Lesson 01 proved</small><b>A number means a character only because we decided it does.</b></div>
                <div><small>Lesson 02 adds</small><b>Both machines have to have made the same decision.</b></div>
              </div>
              <button className="primary-button" onClick={onContinue}>Use the table for a real message →</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
