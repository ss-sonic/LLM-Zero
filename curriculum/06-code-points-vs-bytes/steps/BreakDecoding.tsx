"use client";

import { QuestionPrompt } from "../../../components/ui/QuestionPrompt";
import { TextRecall, type RecallAssessment } from "../../../components/ui/TextRecall";
import { MISMATCH_TEXT, RECEIVER_WIDTH, TOY_RULE_NAME, TOY_WIDTH } from "../config";
import { encodeText, readInGroups, toUnicodeNotation } from "../encoding";

const STREAM = encodeText(MISMATCH_TEXT, TOY_WIDTH);
const GROUPS = readInGroups(STREAM, RECEIVER_WIDTH);

export function BreakDecodingStep({
  sent,
  recallText,
  recallCommitted,
  recallAssessment,
  onSend,
  onRecallChange,
  onRecallCommit,
  onRecallAssess,
  onRecallRewrite,
  onContinue,
}: {
  sent: boolean;
  recallText: string;
  recallCommitted: boolean;
  recallAssessment: RecallAssessment;
  onSend: () => void;
  onRecallChange: (value: string) => void;
  onRecallCommit: () => void;
  onRecallAssess: (assessment: Exclude<RecallAssessment, null>) => void;
  onRecallRewrite: () => void;
  onContinue: () => void;
}) {
  return (
    <div className="screen-layout centered-screen wide-screen l6-screen">
      <QuestionPrompt
        eyebrow="Step 5 · Two rules, one wire"
        title={<>Computer 1 encodes with {TOY_RULE_NAME}. Computer 2 reads in groups of {RECEIVER_WIDTH}.</>}
        lead={`Both machines are working correctly. Both know Unicode. Send “${MISMATCH_TEXT}” across and watch what the receiver makes of it.`}
      />

      <div className="l6-wire">
        <div className="card l6-machine">
          <small>Computer 1 · sender</small>
          <div className="l6-machine-text">{MISMATCH_TEXT}</div>
          <code>{TOY_RULE_NAME}: {TOY_WIDTH} bytes each</code>
        </div>

        <div className="l6-stream">
          {sent
            ? STREAM.map((byte, index) => <code key={index}>{byte}</code>)
            : <span className="l6-stream-idle">{STREAM.length} bytes waiting</span>}
          <small>{sent ? "the wire carries bytes and nothing else" : "nothing has been sent yet"}</small>
        </div>

        <div className="card l6-machine">
          <small>Computer 2 · receiver</small>
          <div className={sent ? "l6-machine-text broken" : "l6-machine-text"}>{sent ? "✗" : "…"}</div>
          <code>reads {RECEIVER_WIDTH} bytes per character</code>
        </div>
      </div>

      {!sent ? (
        <button className="primary-button l6-main-action" onClick={onSend}>Send the bytes →</button>
      ) : (
        <>
          <div className="l6-groups card">
            <small>How Computer 2 grouped them</small>
            <div className="l6-group-list">
              {GROUPS.map((group, index) => (
                <div className={group.value === null ? "l6-group incomplete" : "l6-group wrong"} key={index}>
                  <div className="l6-group-bytes">
                    {group.bytes.map((byte, byteIndex) => <code key={byteIndex}>{byte}</code>)}
                    {group.value === null
                      ? Array.from({ length: RECEIVER_WIDTH - group.bytes.length }, (_, missing) => <code className="missing" key={`missing-${missing}`}>?</code>)
                      : null}
                  </div>
                  <span>
                    {group.value === null
                      ? "incomplete — the message ran out mid-character"
                      : `code point ${group.value.toLocaleString("en-US")} (${toUnicodeNotation(group.value)})`}
                  </span>
                </div>
              ))}
            </div>
            <p className="l6-note">
              The first group is the dangerous one. It is not an error — it is a perfectly valid code point that the sender never wrote.
              The bytes arrived intact and still produced the wrong character.
            </p>
          </div>

          <div className="l6-question-block">
            <h3 className="l6-decision-question">You have seen this shape of failure before. What is missing here?</h3>
            <TextRecall
              label="Name the principle, in your own words."
              value={recallText}
              placeholder="One sentence is enough."
              principle="Both sides must already share the rule that says how values become bytes and how bytes are grouped back into values. Bytes on their own carry no clue about how they were meant to be read."
              committed={recallCommitted}
              assessment={recallAssessment}
              onChange={onRecallChange}
              onCommit={onRecallCommit}
              onAssess={onRecallAssess}
              onRewrite={onRecallRewrite}
            />

            {recallAssessment !== null ? (
              <>
                <div className="l6-layer-echo" aria-label="The same problem at two layers">
                  <div>
                    <small>Lesson 02</small>
                    <b>Numbers need a shared character table.</b>
                    <span>Otherwise 200 means one thing here and another there.</span>
                  </div>
                  <div>
                    <small>Lesson 06</small>
                    <b>Bytes need a shared grouping rule.</b>
                    <span>Otherwise the same six bytes mean two different messages.</span>
                  </div>
                </div>
                <p className="quiet-copy l6-caveat">
                  Same problem, one layer down. Agreeing on identities was not enough once those identities had to travel as bytes.
                </p>
                <button className="primary-button l6-main-action" onClick={onContinue}>Give this rule a name →</button>
              </>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}
