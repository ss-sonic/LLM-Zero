"use client";

import { ChoiceCard } from "../../../components/ui/ChoiceCard";
import { Feedback } from "../../../components/ui/Feedback";
import { QuestionPrompt } from "../../../components/ui/QuestionPrompt";
import { SENTENCE, SENTENCE_CHARACTERS, SENTENCE_TOTALS } from "../config";
import type { EncodingGuess } from "../types";

const ASCII_CHARACTERS = SENTENCE_CHARACTERS.filter((entry) => entry.utf8Length === 1).length;
const CJK_CHARACTERS = SENTENCE_CHARACTERS.filter((entry) => entry.utf8Length === 3).length;
const UTF8_MARGIN = SENTENCE_TOTALS.utf16 - SENTENCE_TOTALS.utf8;

/**
 * The screen that stops Lesson 08 from being over-generalised.
 *
 * Lesson 08 ended by proving UTF-16 is smaller for 你好, which is true and easy
 * to turn into "UTF-16 wins on CJK text". This sentence contains CJK and UTF-16
 * still loses, because five ASCII characters each pay double. The learner finds
 * that out by pricing it rather than being told.
 *
 * It deliberately does not rebuild a surrogate pair. Lesson 08 did that by hand;
 * what is new here is the aggregate — and that the unit count is not the
 * character count.
 */
export function PriceThreeWaysStep({
  guess,
  units,
  utf16Bytes,
  utf32Bytes,
  onGuess,
  onUnitsChange,
  onUtf16Change,
  onUtf32Change,
  onContinue,
}: {
  guess: EncodingGuess;
  units: string;
  utf16Bytes: string;
  utf32Bytes: string;
  onGuess: (guess: Exclude<EncodingGuess, null>) => void;
  onUnitsChange: (value: string) => void;
  onUtf16Change: (value: string) => void;
  onUtf32Change: (value: string) => void;
  onContinue: () => void;
}) {
  const unitsSolved = Number(units) === SENTENCE_TOTALS.utf16Units;
  const unitsTouched = units.trim() !== "";
  const utf16Solved = Number(utf16Bytes) === SENTENCE_TOTALS.utf16;
  const utf16Touched = utf16Bytes.trim() !== "";
  const utf32Solved = Number(utf32Bytes) === SENTENCE_TOTALS.utf32;
  const utf32Touched = utf32Bytes.trim() !== "";
  const solved = unitsSolved && utf16Solved && utf32Solved;

  return (
    <div className="screen-layout centered-screen wide-screen c1-screen">
      <QuestionPrompt
        eyebrow="Step 6 · Price it three ways"
        title={<>Same sentence, same code points, a different rule. Which one is smaller?</>}
        lead={<>Your {SENTENCE_TOTALS.utf8} bytes are a UTF-8 answer. Commit to a guess before you price the alternative — you know something about where each encoding wins.</>}
      />

      {guess === null ? (
        <div className="c1-guess-grid">
          <ChoiceCard variant="large" onClick={() => onGuess("utf-8")}>
            <b>UTF-8 stays smaller</b>
            <span>The variable-width rule keeps winning on this sentence.</span>
          </ChoiceCard>
          <ChoiceCard variant="large" onClick={() => onGuess("utf-16")}>
            <b>UTF-16 comes out smaller</b>
            <span>It was designed around exactly this kind of text.</span>
          </ChoiceCard>
        </div>
      ) : (
        <div className="card c1-price-lab">
          <div className="c1-price-row">
            <div>
              <small>UTF-16 units</small>
              <span>Two bytes each — but how many units does this sentence need?</span>
            </div>
            <input
              className={`c1-input small${unitsSolved ? " right" : ""}${unitsTouched && !unitsSolved ? " wrong" : ""}`}
              type="number"
              min={1}
              value={units}
              onChange={(event) => onUnitsChange(event.target.value)}
              aria-label="Number of 16-bit units UTF-16 needs"
              placeholder="?"
            />
            <small>units</small>
          </div>

          {unitsSolved && (
            <div className="c1-price-row">
              <div>
                <small>UTF-16 bytes</small>
                <span>Every unit is two bytes wide, without exception.</span>
              </div>
              <input
                className={`c1-input small${utf16Solved ? " right" : ""}${utf16Touched && !utf16Solved ? " wrong" : ""}`}
                type="number"
                min={1}
                value={utf16Bytes}
                onChange={(event) => onUtf16Change(event.target.value)}
                aria-label="Bytes UTF-16 needs for the sentence"
                placeholder="?"
              />
              <small>bytes</small>
            </div>
          )}

          {utf16Solved && (
            <div className="c1-price-row">
              <div>
                <small>UTF-32 bytes</small>
                <span>Four bytes per character, whatever the character is.</span>
              </div>
              <input
                className={`c1-input small${utf32Solved ? " right" : ""}${utf32Touched && !utf32Solved ? " wrong" : ""}`}
                type="number"
                min={1}
                value={utf32Bytes}
                onChange={(event) => onUtf32Change(event.target.value)}
                aria-label="Bytes UTF-32 needs for the sentence"
                placeholder="?"
              />
              <small>bytes</small>
            </div>
          )}

        {unitsTouched && !unitsSolved && (
          <Feedback tone="nudge">
            Count the characters, then check each one against U+FFFF. A unit is not a character for every character.
          </Feedback>
        )}
        </div>
      )}

      {solved && (
        <>
          <Feedback tone={guess === "utf-8" ? "success" : "mismatch"}>
            <div className="c1-feedback-copy">
              <b>
                UTF-8 wins by {UTF8_MARGIN} bytes — {SENTENCE_TOTALS.utf8} against {SENTENCE_TOTALS.utf16}.
                {guess === "utf-8" ? " You called it." : ""}
              </b>
              <span>
                {guess === "utf-16"
                  ? `Lesson 08 was right that UTF-16 beats UTF-8 across the CJK range, and it does here too — it saves a byte on each of the ${CJK_CHARACTERS} Chinese characters. It still loses, because ${ASCII_CHARACTERS} ASCII characters each pay double for a unit they do not need.`
                  : `It saves a byte on each of the ${CJK_CHARACTERS} Chinese characters and loses one on each of the ${ASCII_CHARACTERS} ASCII characters. The mix decides the winner, not the script.`}
              </span>
            </div>
          </Feedback>

          <div className="c1-ledger" role="table" aria-label="Bytes per character under each encoding">
            <div className="c1-ledger-head" role="row">
              <span role="columnheader">character</span>
              <span role="columnheader">UTF-8</span>
              <span role="columnheader">UTF-16</span>
              <span role="columnheader">UTF-32</span>
            </div>
            {SENTENCE_CHARACTERS.map((character, index) => (
              <div className="c1-ledger-row" role="row" key={index}>
                <span role="cell">{character.symbol === " " ? "␣" : character.symbol}</span>
                <span role="cell" className={character.utf8Length < character.utf16Length ? "best" : ""}>{character.utf8Length}</span>
                <span role="cell" className={character.utf16Length < character.utf8Length ? "best" : ""}>{character.utf16Length}</span>
                <span role="cell">{character.utf32Length}</span>
              </div>
            ))}
            <div className="c1-ledger-row total" role="row">
              <span role="cell">total</span>
              <span role="cell" className="best">{SENTENCE_TOTALS.utf8}</span>
              <span role="cell">{SENTENCE_TOTALS.utf16}</span>
              <span role="cell">{SENTENCE_TOTALS.utf32}</span>
            </div>
          </div>

          <p className="c1-turn">
            That unit count is not a curiosity. Ask a browser how long this string is and it will say{" "}
            <span className="inline-token">{SENTENCE.length}</span>, not {SENTENCE_TOTALS.characters} — it is counting
            UTF-16 units, and the rocket is two of them.
          </p>

          <button className="primary-button c1-main-action" onClick={onContinue}>Now read some bytes back →</button>
        </>
      )}
    </div>
  );
}
