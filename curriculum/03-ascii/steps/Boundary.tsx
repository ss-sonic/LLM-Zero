"use client";

import { QuestionPrompt } from "../../../components/ui/QuestionPrompt";
import { TextRecall, type RecallAssessment } from "../../../components/ui/TextRecall";
import { encodeAscii } from "../ascii";
import { ASCII_BOUNDARY_SAMPLES } from "../config";

export function BoundaryStep({
  sampleId,
  recallText,
  recallCommitted,
  recallAssessment,
  onTry,
  onRecallChange,
  onRecallCommit,
  onRecallAssess,
  onRecallRewrite,
  onContinue,
}: {
  sampleId: string | null;
  recallText: string;
  recallCommitted: boolean;
  recallAssessment: RecallAssessment;
  onTry: (sampleId: string, failed: boolean) => void;
  onRecallChange: (value: string) => void;
  onRecallCommit: () => void;
  onRecallAssess: (assessment: Exclude<RecallAssessment, null>) => void;
  onRecallRewrite: () => void;
  onContinue: () => void;
}) {
  const selected = ASCII_BOUNDARY_SAMPLES.find((sample) => sample.id === sampleId) ?? null;
  const result = selected ? encodeAscii(selected.text) : null;
  const failed = Boolean(result && result.unsupported.length > 0);

  return (
    <div className="screen-layout centered-screen wide-screen l3-screen">
      <QuestionPrompt
        eyebrow="Step 7 · Find the boundary"
        title="Can ASCII encode every message people might want to type?"
        lead="Choose a message and ask ASCII to encode it. Remember: the original ASCII rulebook only has values 0 through 127."
      />

      <div className="l3-boundary-card card">
        <div className="l3-sample-row">
          {ASCII_BOUNDARY_SAMPLES.map((sample) => {
            const sampleResult = encodeAscii(sample.text);
            const sampleFails = sampleResult.unsupported.length > 0;
            return (
              <button
                className={sampleId === sample.id ? "selected" : ""}
                key={sample.id}
                onClick={() => onTry(sample.id, sampleFails)}
              >{sample.label}</button>
            );
          })}
        </div>

        {!selected && <p className="l3-boundary-prompt">Try a message. ASCII will either return numbers or show where its table runs out.</p>}

        {selected && result && !failed && (
          <div className="l3-boundary-success">
            <small>ASCII can encode {selected.label}</small>
            <code>{result.values.join("  ")}</code>
            <p>Every character in this message has an entry in the ASCII table. Try one of the other examples.</p>
          </div>
        )}

        {selected && result && failed && (
          <div className="l3-boundary-failure">
            <small>ASCII gets stuck</small>
            <strong>{selected.label}</strong>
            <div className="l3-unsupported-row">
              {result.unsupported.map((character, index) => <span key={`${character}-${index}`}>{character} → no ASCII entry</span>)}
            </div>
            <p>The message is perfectly valid human text. The problem is simply that ASCII&apos;s published table does not contain these characters.</p>
          </div>
        )}
      </div>

      {failed && (
        <div className="l3-recall-block">
          <h2 className="l3-decision-question">ASCII just failed. So what did publishing it actually solve?</h2>
          <TextRecall
            label="Answer without looking back at the earlier screens."
            value={recallText}
            placeholder="One sentence is enough."
            principle="Before a published standard, two machines could only understand each other after privately agreeing on a table — and that agreement had to be repeated for every new pair. ASCII replaced all of those private negotiations with one rulebook any machine could implement, so machines that had never met could exchange text. What it did not do is make the rulebook big enough for the world's writing systems."
            committed={recallCommitted}
            assessment={recallAssessment}
            onChange={onRecallChange}
            onCommit={onRecallCommit}
            onAssess={onRecallAssess}
            onRewrite={onRecallRewrite}
          />

          {recallAssessment !== null && (
            <>
              <div className="feedback l3-boundary-feedback">
                <div><b>You found ASCII&apos;s boundary.</b><span>A standard can make everyone agree and still be too small for the world people need to represent. Those are two separate problems, and only one of them is fixed.</span></div>
              </div>
              <button className="primary-button" onClick={onContinue}>Finish Lesson 03 →</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
