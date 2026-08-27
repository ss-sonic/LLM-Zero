"use client";

import { Feedback } from "../../../components/ui/Feedback";
import { QuestionPrompt } from "../../../components/ui/QuestionPrompt";
import { DECODE_BYTES, DECODE_CHARACTERS, DECODE_FIRST, DECODE_HEX, DECODE_LAST, DECODE_TEXT } from "../config";
import { codePointMatches } from "../pipeline";
import { toBinary } from "../../07-utf-8/utf8";

const BINARY = DECODE_BYTES.map((byte) => toBinary(byte, 8));

/**
 * The direction nothing has ever gone all the way.
 *
 * Lesson 07 split a stream into groups and stopped there. Encoding is only half a
 * rule — if the bytes cannot be turned back into the characters that produced
 * them, none of it was worth doing. The stream is one the learner has not seen,
 * so nothing on this screen can be recognised, only decoded.
 */
export function ReadItBackStep({
  groupCount,
  firstCodePoint,
  lastCodePoint,
  onGroupCountChange,
  onFirstChange,
  onLastChange,
  onContinue,
}: {
  groupCount: string;
  firstCodePoint: string;
  lastCodePoint: string;
  onGroupCountChange: (value: string) => void;
  onFirstChange: (value: string) => void;
  onLastChange: (value: string) => void;
  onContinue: () => void;
}) {
  const countTouched = groupCount.trim() !== "";
  const countSolved = Number(groupCount) === DECODE_CHARACTERS.length;

  const firstTouched = firstCodePoint.trim() !== "";
  const firstSolved = codePointMatches(firstCodePoint, DECODE_FIRST.codePoint);
  const lastTouched = lastCodePoint.trim() !== "";
  const lastSolved = codePointMatches(lastCodePoint, DECODE_LAST.codePoint);
  const solved = countSolved && firstSolved && lastSolved;

  return (
    <div className="screen-layout centered-screen wide-screen c1-screen">
      <QuestionPrompt
        eyebrow="Step 7 · Read it back"
        title={<>{DECODE_BYTES.length} bytes arrive with no message beside them. What do they say?</>}
        lead="A stream you have never seen, from someone who is not here to explain it. Everything you need is inside the bytes — that was the entire point of the tags."
      />

      <div className="card c1-stream">
        <small>the stream</small>
        <div className="c1-stream-bytes" aria-label={`Eight bytes: ${DECODE_HEX.join(" ")}`}>
          {DECODE_HEX.map((hex, index) => (
            <code className={countSolved ? "revealed" : ""} key={index}>
              <b>{hex}</b>
              {countSolved && <small>{BINARY[index]}</small>}
            </code>
          ))}
        </div>

        <div className="c1-inline">
          <label htmlFor="group-count">How many characters is that?</label>
          <input
            id="group-count"
            className={`c1-input tight${countSolved ? " right" : ""}${countTouched && !countSolved ? " wrong" : ""}`}
            type="number"
            min={1}
            value={groupCount}
            onChange={(event) => onGroupCountChange(event.target.value)}
            placeholder="?"
          />
        </div>

        {countTouched && !countSolved && (
          <Feedback tone="nudge">
            Expand each byte into bits. A byte starting <code>0</code> is a character on its own; a run of 1s says how many
            bytes that character takes; <code>10</code> means &ldquo;I am the middle of one&rdquo;.
          </Feedback>
        )}
      </div>

      {countSolved && (
        <div className="card c1-decode">
          <p className="c1-build-copy">
            Now strip the tags off the first character and the last one, and put what is left back together as a number.
          </p>
          <div className="c1-decode-rows">
            <div className="c1-decode-row">
              <small>first character · {DECODE_FIRST.utf8Length} bytes</small>
              <code>{DECODE_FIRST.utf8Hex.join(" ")}</code>
              <input
                className={`c1-input tight${firstSolved ? " right" : ""}${firstTouched && !firstSolved ? " wrong" : ""}`}
                value={firstCodePoint}
                onChange={(event) => onFirstChange(event.target.value)}
                aria-label="Code point of the first character"
                placeholder="U+????"
              />
            </div>
            <div className="c1-decode-row">
              <small>last character · {DECODE_LAST.utf8Length} bytes</small>
              <code>{DECODE_LAST.utf8Hex.join(" ")}</code>
              <input
                className={`c1-input tight${lastSolved ? " right" : ""}${lastTouched && !lastSolved ? " wrong" : ""}`}
                value={lastCodePoint}
                onChange={(event) => onLastChange(event.target.value)}
                aria-label="Code point of the last character"
                placeholder="U+????"
              />
            </div>
          </div>

          {(firstTouched || lastTouched) && !(firstSolved && lastSolved) && (
            <Feedback tone="nudge">
              Drop the leading tag from every byte and join the leftovers in order. Group the result into fours and it reads
              straight off as hexadecimal — decimal or <span className="inline-token">U+</span> notation, either is fine.
            </Feedback>
          )}
        </div>
      )}

      {solved && (
        <>
          <div className="c1-decoded" aria-label={`The stream decodes to ${DECODE_TEXT}`}>
            <small>the message</small>
            <strong>{DECODE_TEXT}</strong>
          </div>

          <Feedback tone="success">
            <div className="c1-feedback-copy">
              <b>You read text out of bytes nobody explained to you.</b>
              <span>No length was sent, no separator, no table. The rule ran backwards because the structure was in the bytes themselves.</span>
            </div>
          </Feedback>

          <button className="primary-button c1-main-action" onClick={onContinue}>So why does text still arrive broken? →</button>
        </>
      )}
    </div>
  );
}
