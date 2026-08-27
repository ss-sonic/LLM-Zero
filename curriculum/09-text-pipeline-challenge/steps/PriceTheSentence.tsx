"use client";

import { Feedback } from "../../../components/ui/Feedback";
import { QuestionPrompt } from "../../../components/ui/QuestionPrompt";
import { StreamStrip } from "../StreamStrip";
import { PRIOR_SENTENCE, PRIOR_SENTENCE_BYTES, SENTENCE_CHARACTERS, SENTENCE_TOTALS } from "../config";
import { UTF8_FORMS } from "../../07-utf-8/utf8";
import { toHex } from "../../08-utf-encodings/encodings";

const BANDS = UTF8_FORMS.map((form) => ({
  bytes: form.bytes,
  from: `U+${toHex(form.min, 4)}`,
  to: `U+${toHex(form.max, 4)}`,
}));

/**
 * The bill, and the moment step 1's wager is settled.
 *
 * The band table stays hidden until the learner asks for it. Reading a width off
 * a visible table is transcription; recalling that U+0800 is where three bytes
 * begin is the thing Lesson 07 actually built.
 */
export function PriceTheSentenceStep({
  widths,
  total,
  wager,
  onWidthChange,
  onTotalChange,
  onContinue,
}: {
  widths: string[];
  total: string;
  wager: string;
  onWidthChange: (index: number, value: string) => void;
  onTotalChange: (value: string) => void;
  onContinue: () => void;
}) {
  const matches = SENTENCE_CHARACTERS.map((character, index) => Number(widths[index]) === character.utf8Length);
  const touched = SENTENCE_CHARACTERS.map((_, index) => (widths[index] ?? "").trim() !== "");
  const widthsSolved = matches.every(Boolean);
  const anyWrong = touched.some((isTouched, index) => isTouched && !matches[index]);

  const totalTouched = total.trim() !== "";
  const totalSolved = Number(total) === SENTENCE_TOTALS.utf8;

  const predicted = Number(wager);
  const gap = SENTENCE_TOTALS.utf8 - predicted;

  return (
    <div className="screen-layout centered-screen wide-screen c1-screen">
      <QuestionPrompt
        eyebrow="Step 4 · Price the sentence"
        title={<>You know every identity. So what does each one actually cost?</>}
        lead="One number per character: how many bytes UTF-8 spends on it. No table on screen — the boundaries were the whole point of Lesson 07."
      />

      <div className="card c1-table-lab wide">
        {SENTENCE_CHARACTERS.map((character, index) => (
          <div className="c1-row wide" key={index}>
            <strong className={character.symbol === " " ? "c1-space" : ""}>
              {character.symbol === " " ? "␣" : character.symbol}
            </strong>
            <code>{character.notation}</code>
            <input
              className={`c1-input row${matches[index] ? " right" : ""}${touched[index] && !matches[index] ? " wrong" : ""}`}
              type="number"
              min={1}
              max={4}
              value={widths[index] ?? ""}
              onChange={(event) => onWidthChange(index, event.target.value)}
              aria-label={`Bytes UTF-8 spends on ${character.label}`}
              placeholder="?"
            />
            <small>{matches[index] ? (character.utf8Length === 1 ? "byte" : "bytes") : ""}</small>
          </div>
        ))}
      </div>

      {anyWrong && !widthsSolved && (
        <Feedback tone="nudge">
          <div className="c1-bands">
            <b>The bands you derived, since one of those is off:</b>
            <div>
              {BANDS.map((band) => (
                <span key={band.bytes}><b>{band.bytes}</b> · {band.from} – {band.to}</span>
              ))}
            </div>
          </div>
        </Feedback>
      )}

      {widthsSolved && (
        <>
          <StreamStrip mode="width" caption="Cost per character" />
          <div className="card c1-total">
            <label htmlFor="total-input">Add them up. What does the whole sentence cost?</label>
            <input
              id="total-input"
              className={`c1-input tight${totalSolved ? " right" : ""}${totalTouched && !totalSolved ? " wrong" : ""}`}
              type="number"
              min={1}
              value={total}
              onChange={(event) => onTotalChange(event.target.value)}
              placeholder="?"
            />
            <small>bytes</small>
          </div>
        </>
      )}

      {widthsSolved && totalTouched && !totalSolved && (
        <Feedback tone="nudge">Five characters at one byte, one at two, two at three, one at four. Add the column you just filled in.</Feedback>
      )}

      {totalSolved && (
        <>
          <Feedback tone={gap === 0 ? "success" : "mismatch"}>
            <div className="c1-feedback-copy">
              <b>
                {gap === 0
                  ? `You called it: ${SENTENCE_TOTALS.utf8} bytes.`
                  : `You said ${predicted}. It is ${SENTENCE_TOTALS.utf8}.`}
              </b>
              <span>
                {PRIOR_SENTENCE} costs {PRIOR_SENTENCE_BYTES} bytes and has the same nine characters. Swapping two ASCII
                letters for two Chinese ones costs four more bytes and not one more character. The character count never
                determined the byte count — that is the whole of Lesson 06 in one bill.
              </span>
            </div>
          </Feedback>

          <button className="primary-button c1-main-action" onClick={onContinue}>Build the hardest one by hand →</button>
        </>
      )}
    </div>
  );
}
