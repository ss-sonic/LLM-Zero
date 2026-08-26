"use client";

import { Feedback } from "../../../components/ui/Feedback";
import { QuestionPrompt } from "../../../components/ui/QuestionPrompt";
import { ROCKET } from "../config";
import { UTF8_FORMS } from "../utf8";

const FORM = UTF8_FORMS[3];

/**
 * The mastery check, and the reason the hexadecimal bridge exists.
 *
 * The learner turns U+1F680 into bits one hex digit at a time — the skill F1
 * taught — slices the result the way the tags demand, and arrives at four bytes
 * they have already met: the "which byte changed?" puzzle that opened the bridge
 * was UTF-8 for this character all along.
 */
export function BuildRocketStep({
  formInput,
  digitBits,
  payloads,
  onFormChange,
  onDigitBitsChange,
  onPayloadChange,
  onContinue,
}: {
  formInput: string;
  digitBits: string[];
  payloads: string[];
  onFormChange: (value: string) => void;
  onDigitBitsChange: (index: number, value: string) => void;
  onPayloadChange: (index: number, value: string) => void;
  onContinue: () => void;
}) {
  const formTouched = formInput.trim() !== "";
  const formSolved = Number(formInput) === FORM.bytes;

  const bitsFilled = digitBits.every((value) => value.trim() !== "");
  const bitsMatch = ROCKET.digitBits.map((expected, index) => digitBits[index].trim() === expected);
  const bitsSolved = bitsFilled && bitsMatch.every(Boolean);

  const payloadsFilled = payloads.every((value) => value.trim() !== "");
  const payloadsMatch = ROCKET.payloadSlices.map((expected, index) => payloads[index].trim() === expected);
  const solved = payloadsFilled && payloadsMatch.every(Boolean);

  const allBits = bitsSolved ? `0${ROCKET.digitBits.join("")}` : null;

  return (
    <div className="screen-layout centered-screen wide-screen l7-screen">
      <QuestionPrompt
        eyebrow="Step 7 · Build the rocket"
        title={<>Turn <span className="inline-token">{ROCKET.notation}</span> into real bytes, by hand.</>}
        lead={<>{ROCKET.symbol} is {ROCKET.decimal.toLocaleString("en-US")}. Nothing here is looked up — every step is a rule you have already built.</>}
      />

      <div className="card l7-build">
        <div className="l7-build-task">
          <small>a · choose the form</small>
          <div className="l7-inline">
            <label htmlFor="form-input">How many bytes does {ROCKET.decimal.toLocaleString("en-US")} need?</label>
            <input
              id="form-input"
              className={`l7-input small${formSolved ? " right" : ""}${formTouched && !formSolved ? " wrong" : ""}`}
              type="number"
              min={1}
              max={4}
              value={formInput}
              onChange={(event) => onFormChange(event.target.value)}
              placeholder="?"
            />
          </div>
          {formTouched && !formSolved && (
            <Feedback tone="nudge">
              Compare it against the ranges you just worked out. Three bytes stop at 65,535.
            </Feedback>
          )}
        </div>

        {formSolved && (
          <div className="l7-build-task">
            <small>b · write the code point in bits</small>
            <p className="l7-build-copy">
              Take the hexadecimal one digit at a time. Each hex digit is exactly four bits — that is the whole reason
              hexadecimal was worth learning before this.
            </p>
            <div className="l7-digit-row">
              {ROCKET.hexDigits.map((digit, index) => (
                <label className="l7-digit" key={index}>
                  <b>{digit}</b>
                  <input
                    className={`l7-input bits${bitsMatch[index] ? " right" : ""}${bitsFilled && !bitsMatch[index] ? " wrong" : ""}`}
                    value={digitBits[index]}
                    onChange={(event) => onDigitBitsChange(index, event.target.value.replace(/[^01]/g, "").slice(0, 4))}
                    aria-label={`Four bits for hex digit ${digit}`}
                    placeholder="????"
                  />
                </label>
              ))}
            </div>
            {bitsFilled && !bitsSolved && (
              <Feedback tone="nudge">Each digit is its own four bits, most significant on the left. F is 15.</Feedback>
            )}
          </div>
        )}

        {bitsSolved && (
          <div className="l7-build-task">
            <small>c · slice it to fit the tags</small>
            <p className="l7-build-copy">
              Those five digits gave 20 bits, and the four-byte form holds 21 — so it opens with one more zero.
              Cut the 21 bits into the {FORM.payloadBits.join(" · ")} the tags leave room for.
            </p>
            <div className="l7-bitstream" aria-label={`The code point in 21 bits: ${allBits}`}>
              {allBits?.split("").map((bit, index) => <code key={index}>{bit}</code>)}
            </div>
            <div className="l7-byte-builder">
              {FORM.payloadBits.map((width, index) => {
                const tag = index === 0 ? FORM.leadPrefix : "10";
                return (
                  <label className="l7-byte" key={index}>
                    <small>byte {index + 1}</small>
                    <div className="l7-byte-shape">
                      <span className="l7-tagbits">{tag}</span>
                      <input
                        className={`l7-input bits${payloadsMatch[index] ? " right" : ""}${payloadsFilled && !payloadsMatch[index] ? " wrong" : ""}`}
                        value={payloads[index]}
                        onChange={(event) => onPayloadChange(index, event.target.value.replace(/[^01]/g, "").slice(0, width))}
                        aria-label={`${width} payload bits for byte ${index + 1}, which opens with ${tag}`}
                        placeholder={"?".repeat(width)}
                        style={{ width: `${width * 14 + 22}px` }}
                      />
                    </div>
                    {payloadsMatch[index] && <code className="l7-byte-done">{ROCKET.bytesHex[index]}</code>}
                  </label>
                );
              })}
            </div>
            {payloadsFilled && !solved && (
              <Feedback tone="nudge">
                Take the bits strictly in order, left to right — 3 for the first byte, then 6, 6 and 6. Nothing is
                reordered and nothing is dropped.
              </Feedback>
            )}
          </div>
        )}
      </div>

      {solved && (
        <>
          <Feedback tone="success">
            <div>
              <b>{ROCKET.bytesHex.join(" ")}</b>
              <span>{ROCKET.symbol} is those four bytes, on every machine that has ever stored it. You produced them from a code point and four rules.</span>
            </div>
          </Feedback>

          <div className="l7-callback">
            <small>You have met these before</small>
            <div className="l7-callback-bytes">
              {ROCKET.bytesBinary.map((byte, index) => <code key={index}>{byte}</code>)}
            </div>
            <p>
              This is the row of bits the hexadecimal bridge opened with, when the task was only to spot which byte
              had changed. It was {ROCKET.symbol} the whole time — and the byte that differed in the second row turned
              that character into a different emoji entirely.
            </p>
          </div>

          <button className="primary-button l7-main-action" onClick={onContinue}>Read a real stream →</button>
        </>
      )}
    </div>
  );
}
