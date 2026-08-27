"use client";

import { Feedback } from "../../../components/ui/Feedback";
import { QuestionPrompt } from "../../../components/ui/QuestionPrompt";
import { chooseCharacter, hexBytesMatch } from "../pipeline";
import { UTF8_FORMS, payloadSlicesFor, tagFor, toBinary } from "../../07-utf-8/utf8";
import { toHex } from "../../08-utf-encodings/encodings";

const BANDS = UTF8_FORMS.map((form) => ({ bytes: form.bytes, from: `U+${toHex(form.min, 4)}`, to: `U+${toHex(form.max, 4)}` }));

/**
 * The finale, and the only screen in the course whose content nobody wrote.
 *
 * Every check until now used a character an author picked, which means every
 * check until now could in principle be passed by pattern-matching this project's
 * habits. Here the learner supplies the character, and the only thing that can
 * produce the right bytes is the rule. ASCII is refused on purpose: one byte
 * makes it trivial and Lesson 07 already proved that case.
 *
 * The borrow row exists because a screen that cannot be completed without an
 * emoji keyboard is a broken screen, not a strict one.
 */
const BORROWABLE = ["ñ", "ॐ", "𝄞"];

export function YourOwnCharacterStep({
  chosen,
  lengthValue,
  hexValue,
  onChoose,
  onLengthChange,
  onHexChange,
  onContinue,
}: {
  chosen: string;
  lengthValue: string;
  hexValue: string;
  onChoose: (value: string) => void;
  onLengthChange: (value: string) => void;
  onHexChange: (value: string) => void;
  onContinue: () => void;
}) {
  const result = chooseCharacter(chosen);
  const character = result.ok ? result.character : null;

  const lengthTouched = lengthValue.trim() !== "";
  const lengthSolved = character !== null && Number(lengthValue) === character.utf8Length;
  const hexTouched = hexValue.trim() !== "";
  const hexSolved = character !== null && hexBytesMatch(hexValue, character.utf8Hex);
  const solved = lengthSolved && hexSolved;

  const slices = character ? payloadSlicesFor(character.codePoint) : null;
  const form = character ? UTF8_FORMS.find((entry) => entry.bytes === character.utf8Length) : undefined;

  return (
    <div className="screen-layout centered-screen wide-screen c1-screen">
      <QuestionPrompt
        eyebrow="Step 9 · Your own character"
        title={<>Pick a character we have never shown you. Now produce its bytes.</>}
        lead="Anything your keyboard cannot reach directly — an accented letter, a character from a script you read, an emoji. Nothing on this screen was written for whatever you choose."
      />

      <div className="card c1-choose">
        <div className="c1-inline">
          <label htmlFor="own-character">Your character</label>
          <input
            id="own-character"
            className={`c1-input glyph${character ? " right" : ""}${chosen.trim() !== "" && !character ? " wrong" : ""}`}
            value={chosen}
            onChange={(event) => onChoose(event.target.value)}
            placeholder="?"
          />
        </div>

        {!character && (
          <>
            <Feedback tone="nudge">
              {result.ok === false && result.reason === "ascii"
                ? "That one is ASCII, so UTF-8 spends a single byte on it and there is nothing to build. Pick something outside the first 128."
                : result.ok === false && result.reason === "unusable"
                  ? "That is not a character UTF-8 can encode on its own. Try another."
                  : "One character. Paste it, or open your system's emoji and symbol picker."}
            </Feedback>
            <div className="c1-borrow">
              <small>no way to type one? borrow one</small>
              <div>
                {BORROWABLE.map((symbol) => (
                  <button className="c1-borrow-button" key={symbol} onClick={() => onChoose(symbol)} aria-label={`Use ${symbol}`}>
                    {symbol}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {character && (
          <>
            <div className="c1-lookup">
              <strong>{character.symbol}</strong>
              <div>
                <small>the character database says</small>
                <code>{character.notation}</code>
                <span>decimal {character.codePoint.toLocaleString("en-US")}</span>
              </div>
            </div>

            <div className="c1-own-tasks">
              <div className="c1-inline">
                <label htmlFor="own-length">a · how many bytes does UTF-8 spend on it?</label>
                <input
                  id="own-length"
                  className={`c1-input small${lengthSolved ? " right" : ""}${lengthTouched && !lengthSolved ? " wrong" : ""}`}
                  type="number"
                  min={1}
                  max={4}
                  value={lengthValue}
                  onChange={(event) => onLengthChange(event.target.value)}
                  placeholder="?"
                />
              </div>

              {lengthTouched && !lengthSolved && (
                <Feedback tone="nudge">
                  <div className="c1-bands">
                    <b>Check {character.notation} against the bands:</b>
                    <div>
                      {BANDS.map((band) => (
                        <span key={band.bytes}><b>{band.bytes}</b> · {band.from} – {band.to}</span>
                      ))}
                    </div>
                  </div>
                </Feedback>
              )}

              {lengthSolved && (
                <div className="c1-inline">
                  <label htmlFor="own-hex">b · write those bytes in hexadecimal</label>
                  <input
                    id="own-hex"
                    className={`c1-input wide${hexSolved ? " right" : ""}${hexTouched && !hexSolved ? " wrong" : ""}`}
                    value={hexValue}
                    onChange={(event) => onHexChange(event.target.value)}
                    aria-label={`The UTF-8 bytes for ${character.symbol} in hexadecimal`}
                    placeholder={character.utf8Hex.map(() => "??").join(" ")}
                  />
                </div>
              )}

              {lengthSolved && hexTouched && !hexSolved && slices && form && (
                <Feedback tone="nudge">
                  <div className="c1-bands">
                    <b>Here is the bit work, since that is where it went wrong:</b>
                    <div className="c1-help-template">
                      {slices.map((slice, index) => (
                        <code key={index}><b>{tagFor(form, index)}</b>{slice}</code>
                      ))}
                    </div>
                    <span>Read each of those eight-bit groups as two hexadecimal digits.</span>
                  </div>
                </Feedback>
              )}
            </div>
          </>
        )}
      </div>

      {solved && character && (
        <>
          <Feedback tone="success">
            <div className="c1-feedback-copy">
              <b>{character.symbol} is {character.utf8Hex.join(" ")}, and nobody here chose it.</b>
              <span>You took a character this project has never mentioned from a symbol to the exact bytes a file would hold. That is the whole of Module 01, run by you.</span>
            </div>
          </Feedback>

          <div className="c1-own-proof" aria-label={`How ${character.symbol} is stored`}>
            {character.utf8Bytes.map((byte, index) => (
              <div key={index}>
                <small>byte {index + 1}</small>
                <code>{character.utf8Hex[index]}</code>
                <span>{toBinary(byte, 8)}</span>
              </div>
            ))}
          </div>

          <button className="primary-button c1-main-action" onClick={onContinue}>Finish the challenge →</button>
        </>
      )}
    </div>
  );
}
