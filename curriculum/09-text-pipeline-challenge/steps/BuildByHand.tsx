"use client";

import { Feedback } from "../../../components/ui/Feedback";
import { QuestionPrompt } from "../../../components/ui/QuestionPrompt";
import { StreamStrip } from "../StreamStrip";
import { HAND_BUILD, SENTENCE_TOTALS } from "../config";

const SLICE_LABELS = ["first byte", "second byte", "third byte"];

/**
 * The mastery check: the one UTF-8 form the curriculum has never built.
 *
 * Lesson 07 built the four-byte rocket and Lesson 08 built it again as a
 * surrogate pair. Three bytes has only ever been derived in the abstract, and it
 * is the form that carries most of the world's writing — so the capstone builds
 * it, on a character the learner looked up themselves two screens ago.
 */
export function BuildByHandStep({
  digitBits,
  slices,
  byteHex,
  onDigitBitsChange,
  onSliceChange,
  onByteHexChange,
  onContinue,
}: {
  digitBits: string[];
  slices: string[];
  byteHex: string[];
  onDigitBitsChange: (index: number, value: string) => void;
  onSliceChange: (index: number, value: string) => void;
  onByteHexChange: (index: number, value: string) => void;
  onContinue: () => void;
}) {
  const bitMatches = HAND_BUILD.digitBits.map((expected, index) => digitBits[index] === expected);
  const bitsFilled = HAND_BUILD.digitBits.every((_, index) => (digitBits[index] ?? "").length === 4);
  const bitsSolved = bitMatches.every(Boolean);

  const sliceMatches = HAND_BUILD.payloadSlices.map((expected, index) => slices[index] === expected);
  const slicesFilled = HAND_BUILD.payloadSlices.every((_, index) => (slices[index] ?? "").trim() !== "");
  const slicesSolved = sliceMatches.every(Boolean);

  const hexMatches = HAND_BUILD.utf8Hex.map((expected, index) => (byteHex[index] ?? "").trim().toUpperCase().replace(/^0X/, "") === expected);
  const hexFilled = HAND_BUILD.utf8Hex.every((_, index) => (byteHex[index] ?? "").trim() !== "");
  const solved = hexMatches.every(Boolean);

  return (
    <div className="screen-layout centered-screen wide-screen c1-screen">
      <QuestionPrompt
        eyebrow="Step 5 · Build it by hand"
        title={<>Three bytes for <span className="inline-token">{HAND_BUILD.notation}</span>. Which three?</>}
        lead={<>You have priced {HAND_BUILD.symbol} at {HAND_BUILD.utf8Length} bytes. Now produce them. Three bytes is the form most of the world&apos;s writing lives in, and you have never actually built one.</>}
      />

      <div className="card c1-build">
        <div className="c1-build-task">
          <small>a · the number in binary</small>
          <p className="c1-build-copy">
            Each hexadecimal digit is exactly four bits — that is the only reason the notation exists. Expand all four.
          </p>
          <div className="c1-digits">
            {HAND_BUILD.hexDigits.map((digit, index) => (
              <label className="c1-digit" key={index}>
                <code>{digit}</code>
                <input
                  className={`c1-input nibble${bitMatches[index] ? " right" : ""}${(digitBits[index] ?? "").length === 4 && !bitMatches[index] ? " wrong" : ""}`}
                  value={digitBits[index] ?? ""}
                  onChange={(event) => onDigitBitsChange(index, event.target.value.replace(/[^01]/g, "").slice(0, 4))}
                  aria-label={`Four bits for hexadecimal digit ${digit}`}
                  placeholder="????"
                />
              </label>
            ))}
          </div>
          {bitsFilled && !bitsSolved && (
            <Feedback tone="nudge">Place values 8 · 4 · 2 · 1 inside each group. F is all four bits on; 0 is all four off.</Feedback>
          )}
        </div>

        {bitsSolved && (
          <div className="c1-build-task">
            <small>b · cut it to fit</small>
            <p className="c1-build-copy">
              The three-byte form leaves this much room, and the tags take the rest. Cut the {HAND_BUILD.payloadBits.length} bits
              strictly left to right — nothing dropped, nothing reordered.
            </p>
            <div className="c1-bitstream" aria-label={`The code point in ${HAND_BUILD.payloadBits.length} bits: ${HAND_BUILD.payloadBits}`}>
              {HAND_BUILD.payloadBits.split("").map((bit, index) => (
                <code className={index === 3 || index === 9 ? "edge" : ""} key={index}>{bit}</code>
              ))}
            </div>
            <div className="c1-template" aria-label="The three-byte form">
              {HAND_BUILD.tags.map((tag, index) => (
                <span key={index}>
                  <b>{tag}</b>{"x".repeat(HAND_BUILD.payloadSlices[index].length)}
                </span>
              ))}
            </div>
            <div className="c1-slices">
              {SLICE_LABELS.map((label, index) => (
                <label className="c1-slice" key={label}>
                  <small>{label}</small>
                  <input
                    className={`c1-input bits${sliceMatches[index] ? " right" : ""}${slicesFilled && !sliceMatches[index] ? " wrong" : ""}`}
                    value={slices[index] ?? ""}
                    onChange={(event) => onSliceChange(index, event.target.value.replace(/[^01]/g, "").slice(0, HAND_BUILD.payloadSlices[index].length))}
                    aria-label={`Payload bits for the ${label}`}
                    placeholder={"?".repeat(HAND_BUILD.payloadSlices[index].length)}
                  />
                </label>
              ))}
            </div>
            {slicesFilled && !slicesSolved && (
              <Feedback tone="nudge">
                Four bits, then six, then six. The lead tag takes half of the first byte, and every continuation byte gives up two bits to say it is one.
              </Feedback>
            )}
          </div>
        )}

        {slicesSolved && (
          <div className="c1-build-task">
            <small>c · tag it and write the byte</small>
            <p className="c1-build-copy">
              Put each slice behind its tag, then write the finished eight bits as two hexadecimal digits.
            </p>
            <div className="c1-assemble">
              {HAND_BUILD.tags.map((tag, index) => (
                <div className="c1-assemble-row" key={index}>
                  <code><b>{tag}</b>{HAND_BUILD.payloadSlices[index]}</code>
                  <span>=</span>
                  <input
                    className={`c1-input small${hexMatches[index] ? " right" : ""}${hexFilled && !hexMatches[index] ? " wrong" : ""}`}
                    value={byteHex[index] ?? ""}
                    onChange={(event) => onByteHexChange(index, event.target.value)}
                    aria-label={`Byte ${index + 1} in hexadecimal`}
                    placeholder="??"
                  />
                </div>
              ))}
            </div>
            {hexFilled && !solved && (
              <Feedback tone="nudge">Split the eight bits down the middle and read each half as one hexadecimal digit.</Feedback>
            )}
          </div>
        )}
      </div>

      {solved && (
        <>
          <Feedback tone="success">
            <div className="c1-feedback-copy">
              <b>{HAND_BUILD.symbol} is {HAND_BUILD.utf8Hex.join(" ")}.</b>
              <span>Three bytes, none of which is a character on its own, and a reader can tell that from the first one alone.</span>
            </div>
          </Feedback>

          <StreamStrip mode="bytes" caption="The sentence, as bytes" />

          <p className="c1-turn">
            That is the whole sentence: {SENTENCE_TOTALS.characters} symbols you can see, {SENTENCE_TOTALS.utf8} bytes a file
            would hold — and you decided every one of them.
          </p>

          <button className="primary-button c1-main-action" onClick={onContinue}>What would another rule have cost? →</button>
        </>
      )}
    </div>
  );
}
