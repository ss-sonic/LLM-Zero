"use client";

import { Feedback } from "../../../components/ui/Feedback";
import { QuestionPrompt } from "../../../components/ui/QuestionPrompt";
import { ROCKET, SUPPLEMENTARY_START } from "../config";
import { HIGH_SURROGATE_MIN, LOW_SURROGATE_MIN, toHex } from "../encodings";
import { encodeCodePoint, toHexByte } from "../../07-utf-8/utf8";

const UTF8_BYTES = encodeCodePoint(0x1f680)!.map(toHexByte);

/**
 * The mastery check, and a deliberate echo of Lesson 07.
 *
 * The same character, built by hand, twice in a row under two encodings — which
 * is the cleanest possible demonstration that bytes are chosen by a rule rather
 * than implied by the code point.
 */
export function BuildRocketAgainStep({
  offsetValue,
  halfBits,
  halfValues,
  onOffsetChange,
  onHalfBitsChange,
  onHalfValueChange,
  onContinue,
}: {
  offsetValue: string;
  halfBits: string[];
  halfValues: string[];
  onOffsetChange: (value: string) => void;
  onHalfBitsChange: (index: number, value: string) => void;
  onHalfValueChange: (index: number, value: string) => void;
  onContinue: () => void;
}) {
  const normalizedOffset = offsetValue.trim().toUpperCase().replace(/^0X/, "");
  const offsetTouched = normalizedOffset !== "";
  const offsetSolved = normalizedOffset === ROCKET.offsetHex || Number(offsetValue) === parseInt(ROCKET.offsetHex, 16);

  const expectedBits = [ROCKET.highBits, ROCKET.lowBits];
  const bitsFilled = halfBits.every((value) => value.trim() !== "");
  const bitsMatch = expectedBits.map((expected, index) => halfBits[index].trim() === expected);
  const bitsSolved = bitsFilled && bitsMatch.every(Boolean);

  const expectedValues = [ROCKET.highValue, ROCKET.lowValue];
  const valuesFilled = halfValues.every((value) => value.trim() !== "");
  const valuesMatch = expectedValues.map((expected, index) => Number(halfValues[index]) === expected);
  const solved = valuesFilled && valuesMatch.every(Boolean);

  return (
    <div className="screen-layout centered-screen wide-screen l8-screen">
      <QuestionPrompt
        eyebrow="Step 7 · Build the rocket again"
        title={<>Same character, same code point, a different rule. What is <span className="inline-token">{ROCKET.notation}</span> in UTF-16?</>}
        lead={<>Last lesson you turned {ROCKET.symbol} into four UTF-8 bytes. It does not fit in one 16-bit unit, so it needs a pair — and a pair is built from an offset, not from the code point itself.</>}
      />

      <div className="card l8-build">
        <div className="l8-build-task">
          <small>a · find the offset</small>
          <div className="l8-inline">
            <label htmlFor="offset-input">
              Pairs only cover what a single unit cannot, so counting starts at U+{toHex(SUPPLEMENTARY_START, 4)}.
              Subtract it from {ROCKET.notation}.
            </label>
            <input
              id="offset-input"
              className={`l8-input tight${offsetSolved ? " right" : ""}${offsetTouched && !offsetSolved ? " wrong" : ""}`}
              value={offsetValue}
              onChange={(event) => onOffsetChange(event.target.value)}
              placeholder="?"
            />
          </div>
          {offsetTouched && !offsetSolved && (
            <Feedback tone="nudge">
              In hexadecimal this subtraction is almost free: {ROCKET.notation} minus U+{toHex(SUPPLEMENTARY_START, 4)} only removes the leading digit.
            </Feedback>
          )}
        </div>

        {offsetSolved && (
          <div className="l8-build-task">
            <small>b · split it down the middle</small>
            <p className="l8-build-copy">
              The offset is 20 bits, and each half of the pair carries 10 of them. Cut it in two.
            </p>
            <div className="l8-bitstream" aria-label={`The offset in 20 bits: ${ROCKET.offsetBits}`}>
              {ROCKET.offsetBits.split("").map((bit, index) => (
                <code className={index === 9 ? "edge" : ""} key={index}>{bit}</code>
              ))}
            </div>
            <div className="l8-halves">
              {["first half", "second half"].map((label, index) => (
                <label className="l8-half" key={label}>
                  <small>{label}</small>
                  <input
                    className={`l8-input bits${bitsMatch[index] ? " right" : ""}${bitsFilled && !bitsMatch[index] ? " wrong" : ""}`}
                    value={halfBits[index]}
                    onChange={(event) => onHalfBitsChange(index, event.target.value.replace(/[^01]/g, "").slice(0, 10))}
                    aria-label={`Ten bits for the ${label} of the pair`}
                    placeholder="??????????"
                  />
                </label>
              ))}
            </div>
            {bitsFilled && !bitsSolved && (
              <Feedback tone="nudge">Ten bits each, taken strictly left to right. Nothing is dropped and nothing is reordered.</Feedback>
            )}
          </div>
        )}

        {bitsSolved && (
          <div className="l8-build-task">
            <small>c · read each half as a number</small>
            <p className="l8-build-copy">
              Each half is an offset into its reserved block — a position, exactly like the code points you assigned in Lesson 05.
            </p>
            <div className="l8-halves">
              {[
                { label: "first half", base: HIGH_SURROGATE_MIN, bits: ROCKET.highBits },
                { label: "second half", base: LOW_SURROGATE_MIN, bits: ROCKET.lowBits },
              ].map((half, index) => (
                <div className="l8-half-sum" key={half.label}>
                  <code>{half.bits}</code>
                  <span>=</span>
                  <input
                    className={`l8-input small${valuesMatch[index] ? " right" : ""}${valuesFilled && !valuesMatch[index] ? " wrong" : ""}`}
                    type="number"
                    min={0}
                    max={1023}
                    value={halfValues[index]}
                    onChange={(event) => onHalfValueChange(index, event.target.value)}
                    aria-label={`Value of the ${half.label}`}
                    placeholder="?"
                  />
                  {valuesMatch[index] && (
                    <b>→ U+{toHex(half.base, 4)} + {expectedValues[index]} = U+{toHex(half.base + expectedValues[index], 4)}</b>
                  )}
                </div>
              ))}
            </div>
            {valuesFilled && !solved && (
              <Feedback tone="nudge">
                Same positional binary you have used since Lesson 01 — add the place values wherever a bit is 1.
              </Feedback>
            )}
          </div>
        )}
      </div>

      {solved && (
        <>
          <Feedback tone="success">
            <div>
              <b>{ROCKET.symbol} is U+{toHex(ROCKET.highUnit, 4)} U+{toHex(ROCKET.lowUnit, 4)} in UTF-16.</b>
              <span>Two units, neither of which is a character on its own. Every emoji you have ever seen in a JavaScript string is stored exactly like this.</span>
            </div>
          </Feedback>

          <div className="l8-two-ways" aria-label="The same character under two encodings">
            <div><small>UTF-8 · Lesson 07</small><code>{UTF8_BYTES.join(" ")}</code><span>4 bytes, tagged</span></div>
            <div><small>UTF-16 · this lesson</small><code>{toHex(ROCKET.highUnit, 4)} {toHex(ROCKET.lowUnit, 4)}</code><span>2 units — also 4 bytes, reserved</span></div>
          </div>
          <p className="l8-turn">
            One code point. One character. Two completely different byte sequences, and neither is more correct than the other —
            which is precisely what Lesson 06 said an encoding would turn out to be.
          </p>

          <button className="primary-button l8-main-action" onClick={onContinue}>So which would you use? →</button>
        </>
      )}
    </div>
  );
}
