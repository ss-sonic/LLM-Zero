"use client";

import { Feedback } from "../../../components/ui/Feedback";
import { QuestionPrompt } from "../../../components/ui/QuestionPrompt";
import { AMBIGUOUS_BYTES, AMBIGUOUS_SPLIT_INDEX } from "../config";
import { isScalarValue } from "../utf8";

/** Only characters the curriculum has actually shown are named; the rest are left as numbers. */
const NAMED: Record<number, { glyph: string; note: string }> = {
  9: { glyph: "⇥", note: "a tab — a control character" },
  40: { glyph: "(", note: "LEFT PARENTHESIS" },
  65: { glyph: "A", note: "LATIN CAPITAL LETTER A" },
  2344: { glyph: "न", note: "DEVANAGARI LETTER NA" },
};

function describe(codePoint: number) {
  return NAMED[codePoint] ?? {
    glyph: isScalarValue(codePoint) ? String.fromCodePoint(codePoint) : "—",
    note: `code point ${codePoint.toLocaleString("en-US")}`,
  };
}

function readingFor(splits: boolean[]) {
  const groups: number[][] = [];
  let current: number[] = [];

  AMBIGUOUS_BYTES.forEach((byte, index) => {
    current.push(byte);
    if (index === AMBIGUOUS_BYTES.length - 1 || splits[index]) {
      groups.push(current);
      current = [];
    }
  });

  return groups.map((group) => group.reduce((total, byte) => total * 256 + byte, 0));
}

/**
 * The screen the lesson turns on.
 *
 * The learner cuts the stream themselves and then sees that the other cut is
 * exactly as valid. Being told "variable length is ambiguous" teaches nothing;
 * committing to one reading and watching the alternative hold up is the point.
 */
export function ReadStreamStep({
  splits,
  committed,
  onToggleSplit,
  onCommit,
  onContinue,
}: {
  splits: boolean[];
  committed: boolean;
  onToggleSplit: (index: number) => void;
  onCommit: () => void;
  onContinue: () => void;
}) {
  const chosen = readingFor(splits);
  const intended = splits.map((_, index) => index === AMBIGUOUS_SPLIT_INDEX);
  const readIntended = chosen.length === 2 && chosen[0] === 2344;
  // Always contrast against a reading that is worth looking at: what the sender
  // meant, or — if the learner already found it — cutting every byte apart.
  const alternative = readingFor(readIntended ? splits.map(() => true) : intended);

  return (
    <div className="screen-layout centered-screen wide-screen l7-screen">
      <QuestionPrompt
        eyebrow="Step 3 · Where does it start?"
        title="Three bytes arrive. Where does one character end and the next begin?"
        lead="You are the receiver now. You know the rule — as many byte positions as the number needs — and this is everything that came down the wire."
      />

      <div className="card l7-stream-lab">
        <div className="l7-stream" aria-label={`Incoming bytes ${AMBIGUOUS_BYTES.join(", ")}`}>
          {AMBIGUOUS_BYTES.map((byte, index) => (
            <span className="l7-stream-cell" key={index}>
              <code>{byte}</code>
              {index < AMBIGUOUS_BYTES.length - 1 && (
                <button
                  className={splits[index] ? "l7-cut on" : "l7-cut"}
                  onClick={() => onToggleSplit(index)}
                  disabled={committed}
                  aria-label={`${splits[index] ? "Remove the" : "Place a"} character boundary after byte ${index + 1}`}
                  aria-pressed={splits[index]}
                >
                  {splits[index] ? "│" : "┆"}
                </button>
              )}
            </span>
          ))}
        </div>
        <p className="l7-stream-hint">
          {committed ? "This is the reading you committed to." : "Click between bytes to cut the stream into characters, then read it."}
        </p>

        {!committed ? (
          <button className="primary-button" onClick={onCommit}>Read it as characters →</button>
        ) : (
          <div className="l7-readings">
            <div className="l7-reading yours">
              <small>Your reading</small>
              <div className="l7-reading-glyphs">
                {chosen.map((codePoint, index) => (
                  <span key={index}><b>{describe(codePoint).glyph}</b><em>{describe(codePoint).note}</em></span>
                ))}
              </div>
            </div>
            <div className="l7-reading">
              <small>{readIntended ? "Also legal" : "What the sender meant"}</small>
              <div className="l7-reading-glyphs">
                {alternative.map((codePoint, index) => (
                  <span key={index}><b>{describe(codePoint).glyph}</b><em>{describe(codePoint).note}</em></span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {committed && (
        <>
          <Feedback tone="mismatch">
            <div>
              <b>Both readings obey the rule you invented.</b>
              <span>
                Three bytes can be cut four different ways and every one of them is legal, because the bytes never said
                how far a character extends. The receiver has to guess — and a guess is not an encoding. Making the bytes
                smaller broke the one thing fixed width was doing for free.
              </span>
            </div>
          </Feedback>
          <p className="l7-turn">The length has to be written inside the bytes themselves. The question is what it can be written with, when every bit already belongs to a number.</p>
          <button className="primary-button l7-main-action" onClick={onContinue}>Look for a spare bit →</button>
        </>
      )}
    </div>
  );
}
