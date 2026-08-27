"use client";

import { Feedback } from "../../../components/ui/Feedback";
import { QuestionPrompt } from "../../../components/ui/QuestionPrompt";
import { TextRecall, type RecallAssessment } from "../../../components/ui/TextRecall";
import { MOJIBAKE } from "../config";
import { toBinary } from "../../07-utf-8/utf8";

const BINARY = MOJIBAKE.bytes.map((byte) => toBinary(byte, 8));

/**
 * Diagnosis, which nothing in the curriculum has asked for yet.
 *
 * Lesson 06 let the learner watch an agreement break; here they are handed the
 * wreckage with no narration and have to work out what happened. The failure is
 * real ISO-8859-1 mojibake on the first four characters of their own sentence,
 * and the honest answer — the bytes are perfect, the reader guessed — is Lesson
 * 02's principle one level below where they first met it.
 */
export function DiagnoseTheBreakStep({
  countValue,
  selectedByte,
  recallText,
  committed,
  assessment,
  onCountChange,
  onSelectByte,
  onRecallChange,
  onCommit,
  onAssess,
  onRewrite,
  onContinue,
}: {
  countValue: string;
  selectedByte: number | null;
  recallText: string;
  committed: boolean;
  assessment: RecallAssessment;
  onCountChange: (value: string) => void;
  onSelectByte: (index: number) => void;
  onRecallChange: (value: string) => void;
  onCommit: () => void;
  onAssess: (assessment: Exclude<RecallAssessment, null>) => void;
  onRewrite: () => void;
  onContinue: () => void;
}) {
  const countTouched = countValue.trim() !== "";
  const countSolved = Number(countValue) === MOJIBAKE.realCharacters;
  const byteSolved = selectedByte === MOJIBAKE.leadByteIndex;
  const byteTouched = selectedByte !== null;

  return (
    <div className="screen-layout centered-screen wide-screen c1-screen">
      <QuestionPrompt
        eyebrow="Step 8 · Diagnose the break"
        title={<>These bytes are perfect UTF-8. So why does the screen say <span className="inline-token">{MOJIBAKE.broken}</span>?</>}
        lead={<>Someone stored the first word of your sentence and opened it somewhere else. Nothing was lost in transit and nothing is damaged. Find the fault.</>}
      />

      <div className="card c1-break">
        <div className="c1-break-heads">
          <div><small>written</small><strong>{MOJIBAKE.text}</strong></div>
          <span>→</span>
          <div className="broken"><small>opened</small><strong>{MOJIBAKE.broken}</strong></div>
        </div>

        <div className="c1-stream-bytes" aria-label={`The bytes on disk: ${MOJIBAKE.hex.join(" ")}`}>
          {MOJIBAKE.hex.map((hex, index) => (
            <button
              className={`c1-byte-pick${selectedByte === index ? " picked" : ""}${byteSolved && index === MOJIBAKE.leadByteIndex ? " right" : ""}`}
              key={index}
              onClick={() => onSelectByte(index)}
              aria-label={`Byte ${index + 1}, ${hex}, binary ${BINARY[index]}`}
              aria-pressed={selectedByte === index}
            >
              <b>{hex}</b>
              <small>{BINARY[index]}</small>
            </button>
          ))}
        </div>

        <div className="c1-inline">
          <label htmlFor="real-count">
            The reader made {MOJIBAKE.brokenCharacters} characters out of {MOJIBAKE.bytes.length} bytes. How many characters
            are actually there?
          </label>
          <input
            id="real-count"
            className={`c1-input tight${countSolved ? " right" : ""}${countTouched && !countSolved ? " wrong" : ""}`}
            type="number"
            min={1}
            value={countValue}
            onChange={(event) => onCountChange(event.target.value)}
            placeholder="?"
          />
        </div>

        {countTouched && !countSolved && (
          <Feedback tone="nudge">Read the bits. One of those bytes is not a character on its own, and one of them says so.</Feedback>
        )}

        {countSolved && (
          <div className="c1-inline">
            <p className="c1-pick-prompt">One byte above announces that another belongs with it. Click it.</p>
            {byteTouched && !byteSolved && (
              <span className="c1-inline-wrong">Not that one — look for a run of 1s at the start, not a <code>10</code>.</span>
            )}
          </div>
        )}
      </div>

      {countSolved && byteSolved && (
        <>
          <Feedback tone="mismatch">
            <div className="c1-feedback-copy">
              <b>{MOJIBAKE.hex[MOJIBAKE.leadByteIndex]} {MOJIBAKE.hex[MOJIBAKE.leadByteIndex + 1]} is one character. The reader made it two.</b>
              <span>Every byte here is exactly what you would have produced. Nothing is corrupted, and the file is not the problem.</span>
            </div>
          </Feedback>

          <div className="c1-recall-block">
            <TextRecall
              label="So what actually went wrong? One or two sentences."
              value={recallText}
              placeholder="Write it in your own words before the principle is revealed."
              committed={committed}
              assessment={assessment}
              principle={<>
                The reader was never told which encoding the bytes were in, and fell back to one byte per character.
                In UTF-8 the two bytes {MOJIBAKE.hex[MOJIBAKE.leadByteIndex]} {MOJIBAKE.hex[MOJIBAKE.leadByteIndex + 1]} are
                a single character, é; under a one-byte rule they are two, Ã and ©. Bytes carry no label saying what they
                are, so sender and reader have to agree in advance — which is exactly the disagreement Lesson 02 built two
                machines to demonstrate, one level further down.
              </>}
              onChange={onRecallChange}
              onCommit={onCommit}
              onAssess={onAssess}
              onRewrite={onRewrite}
            />
          </div>
        </>
      )}

      {assessment !== null && (
        <button className="primary-button c1-main-action" onClick={onContinue}>One last character →</button>
      )}
    </div>
  );
}
