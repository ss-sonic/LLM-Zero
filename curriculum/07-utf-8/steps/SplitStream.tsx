"use client";

import { Feedback } from "../../../components/ui/Feedback";
import { QuestionPrompt } from "../../../components/ui/QuestionPrompt";
import { TextRecall, type RecallAssessment } from "../../../components/ui/TextRecall";
import { STREAM_BYTES, STREAM_TEXT } from "../config";
import { classifyByte, decodeToText, splitIntoCharacters, toBinary, toHexByte } from "../utf8";
import type { ByteLabel } from "../types";

const EXPECTED: ByteLabel[] = STREAM_BYTES.map((byte) => classifyByte(byte) === "continuation" ? "continuation" : "start");
const GROUPS = splitIntoCharacters(STREAM_BYTES) ?? [];
const FIRST_CONTINUATION = STREAM_BYTES.findIndex((byte) => classifyByte(byte) === "continuation");
/** Where a reader that joined at FIRST_CONTINUATION lands after skipping continuations. */
const RESYNC_INDEX = STREAM_BYTES.findIndex((byte, index) => index >= FIRST_CONTINUATION && classifyByte(byte) !== "continuation");

/**
 * The completion check: decode a real stream using nothing but the tags.
 *
 * The learner labels each byte from its opening bits, and the grouping falls out
 * on its own — which is the property the whole lesson was built to produce.
 */
export function SplitStreamStep({
  labels,
  resyncSeen,
  recallText,
  recallCommitted,
  recallAssessment,
  onCycleLabel,
  onShowResync,
  onRecallChange,
  onRecallCommit,
  onRecallAssess,
  onRecallRewrite,
  onContinue,
}: {
  labels: ByteLabel[];
  resyncSeen: boolean;
  recallText: string;
  recallCommitted: boolean;
  recallAssessment: RecallAssessment;
  onCycleLabel: (index: number) => void;
  onShowResync: () => void;
  onRecallChange: (value: string) => void;
  onRecallCommit: () => void;
  onRecallAssess: (assessment: Exclude<RecallAssessment, null>) => void;
  onRecallRewrite: () => void;
  onContinue: () => void;
}) {
  const filled = labels.every((label) => label !== null);
  const matches = EXPECTED.map((expected, index) => labels[index] === expected);
  const solved = filled && matches.every(Boolean);
  const wrongIndex = filled ? matches.findIndex((match) => !match) : -1;

  return (
    <div className="screen-layout centered-screen wide-screen l7-screen">
      <QuestionPrompt
        eyebrow="Step 8 · Split the stream"
        title="Thirteen bytes, no lengths, no separators. Where does each character begin?"
        lead="Label every byte from its opening bits alone. You are not told how many characters there are."
      />

      <div className="card l7-split-lab">
        <div className="l7-byte-strip" aria-label={`Incoming bytes: ${STREAM_BYTES.map(toHexByte).join(" ")}`}>
          {STREAM_BYTES.map((byte, index) => (
            <button
              className={`l7-byte-cell${labels[index] ? ` ${labels[index]}` : ""}${filled && !matches[index] ? " wrong" : ""}`}
              key={index}
              onClick={() => onCycleLabel(index)}
              aria-label={`Byte ${index + 1}, ${toBinary(byte, 8)}, currently ${labels[index] ?? "unlabelled"}`}
            >
              <code>{toBinary(byte, 8)}</code>
              <b>{toHexByte(byte)}</b>
              <small>{labels[index] === "start" ? "starts" : labels[index] === "continuation" ? "middle" : "?"}</small>
            </button>
          ))}
        </div>
        <p className="l7-split-hint">Click a byte to cycle it between <b>starts a character</b> and <b>middle of one</b>.</p>

        {wrongIndex >= 0 && (
          <Feedback tone="nudge">
            Look again at byte {wrongIndex + 1}: <code>{toBinary(STREAM_BYTES[wrongIndex], 8)}</code>.
            {classifyByte(STREAM_BYTES[wrongIndex]) === "continuation"
              ? " It opens with 10, and only a continuation byte does that."
              : " It does not open with 10, so it cannot be the middle of anything."}
          </Feedback>
        )}
      </div>

      {solved && (
        <>
          <div className="l7-decoded" aria-label="The decoded message">
            {GROUPS.map((group, index) => (
              <div className="l7-decoded-char" key={index}>
                <b>{decodeToText(group) === " " ? "␠" : decodeToText(group)}</b>
                <small>{group.length} {group.length === 1 ? "byte" : "bytes"}</small>
              </div>
            ))}
          </div>
          <Feedback tone="success">
            <div>
              <b>{STREAM_TEXT} — {GROUPS.length} characters from {STREAM_BYTES.length} bytes.</b>
              <span>No length was sent alongside them. The structure was inside the bytes, exactly where step 3 said it had to be.</span>
            </div>
          </Feedback>

          {!resyncSeen ? (
            <button className="primary-button l7-main-action" onClick={onShowResync}>Now start reading from the middle →</button>
          ) : (
            <div className="l7-resync">
              <small>Dropped into the stream at byte {FIRST_CONTINUATION + 1}</small>
              <div className="l7-byte-strip small">
                {STREAM_BYTES.slice(FIRST_CONTINUATION).map((byte, offset) => {
                  const index = FIRST_CONTINUATION + offset;
                  const state = index < RESYNC_INDEX ? "skip" : index === RESYNC_INDEX ? "landed" : "";
                  return <code className={state} key={index}>{toBinary(byte, 8)}</code>;
                })}
              </div>
              <p>
                Skip anything opening <b>10</b> and the next character start appears immediately. A reader that joins
                halfway, or a stream that loses a byte, costs one character — not everything after it.
              </p>
            </div>
          )}
        </>
      )}

      {solved && resyncSeen && (
        <div className="l7-recall-block">
          <h2 className="l7-decision-question">Say it in your own words: why can a reader always find the next character?</h2>
          <TextRecall
            label="Commit your answer before the principle appears."
            value={recallText}
            placeholder="One or two sentences."
            principle="Because a byte's role is written into the byte. Continuation bytes always open with 10 and first bytes never do, so a reader that has lost its place skips 10-bytes until it reaches one that is not — and that byte begins a character. The first byte also carries its own length as a run of 1s, so nothing outside the stream has to be consulted."
            committed={recallCommitted}
            assessment={recallAssessment}
            onChange={onRecallChange}
            onCommit={onRecallCommit}
            onAssess={onRecallAssess}
            onRewrite={onRecallRewrite}
          />
          {recallAssessment !== null && (
            <button className="primary-button l7-main-action" onClick={onContinue}>Finish Lesson 07 →</button>
          )}
        </div>
      )}
    </div>
  );
}
