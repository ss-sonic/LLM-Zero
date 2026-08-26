"use client";

import { Feedback } from "../../../components/ui/Feedback";
import { QuestionPrompt } from "../../../components/ui/QuestionPrompt";
import { toHexByte } from "../../07-utf-8/utf8";
import {
  SAMPLE_CHARACTERS,
  SAMPLE_TEXT,
  SAMPLE_UTF8_BYTES,
  TARGET_CHARACTER_INDEX,
  UTF32_TARGET_BYTE,
  UTF8_TARGET_BYTE,
} from "../config";

export function FixedWidthBuysStep({
  utf8Value,
  utf32Value,
  onUtf8Change,
  onUtf32Change,
  onContinue,
}: {
  utf8Value: string;
  utf32Value: string;
  onUtf8Change: (value: string) => void;
  onUtf32Change: (value: string) => void;
  onContinue: () => void;
}) {
  const utf8Touched = utf8Value.trim() !== "";
  const utf32Touched = utf32Value.trim() !== "";
  const utf8Solved = Number(utf8Value) === UTF8_TARGET_BYTE;
  const utf32Solved = Number(utf32Value) === UTF32_TARGET_BYTE;
  const solved = utf8Solved && utf32Solved;

  return (
    <div className="screen-layout centered-screen wide-screen l8-screen">
      <QuestionPrompt
        eyebrow="Step 2 · What fixed width buys"
        title={<>Where does character {TARGET_CHARACTER_INDEX} of <span className="inline-token">{SAMPLE_TEXT}</span> begin?</>}
        lead="Not which character it is — which byte you have to jump to in order to start reading it. Answer it for both encodings and notice what you had to do each time."
      />

      <div className="card l8-access-lab">
        <div className="l8-access-row">
          <div className="l8-access-label">
            <small>UTF-8</small>
            <b>{SAMPLE_UTF8_BYTES.length} bytes</b>
            <span>1 to 4 bytes per character</span>
          </div>
          <div className="l8-byte-run" aria-label={`UTF-8 bytes: ${SAMPLE_UTF8_BYTES.map(toHexByte).join(" ")}`}>
            {SAMPLE_UTF8_BYTES.map((byte, index) => (
              <code key={index}><small>{index + 1}</small>{toHexByte(byte)}</code>
            ))}
          </div>
          <input
            className={`l8-input small${utf8Solved ? " right" : ""}${utf8Touched && !utf8Solved ? " wrong" : ""}`}
            type="number"
            min={1}
            value={utf8Value}
            onChange={(event) => onUtf8Change(event.target.value)}
            aria-label={`Byte where character ${TARGET_CHARACTER_INDEX} begins in UTF-8`}
            placeholder="?"
          />
        </div>

        <div className="l8-access-row">
          <div className="l8-access-label">
            <small>UTF-32</small>
            <b>{SAMPLE_CHARACTERS.length * 4} bytes</b>
            <span>always 4 bytes per character</span>
          </div>
          <div className="l8-byte-run fixed" aria-label="UTF-32 units, four bytes each">
            {SAMPLE_CHARACTERS.map((character, index) => (
              <code key={index}><small>{index * 4 + 1}</small>{character === " " ? "␠" : character}</code>
            ))}
          </div>
          <input
            className={`l8-input small${utf32Solved ? " right" : ""}${utf32Touched && !utf32Solved ? " wrong" : ""}`}
            type="number"
            min={1}
            value={utf32Value}
            onChange={(event) => onUtf32Change(event.target.value)}
            aria-label={`Byte where character ${TARGET_CHARACTER_INDEX} begins in UTF-32`}
            placeholder="?"
          />
        </div>

        {utf8Touched && !utf8Solved && (
          <Feedback tone="nudge">
            The UTF-8 answer cannot be calculated. Walk the stream from the first byte, using the tags to count characters as you go.
          </Feedback>
        )}
        {utf32Touched && !utf32Solved && utf8Solved && (
          <Feedback tone="nudge">
            This one is arithmetic: {TARGET_CHARACTER_INDEX - 1} whole characters come first, and each is exactly four bytes.
          </Feedback>
        )}
      </div>

      {solved && (
        <>
          <Feedback tone="success">
            <div>
              <b>Byte {UTF8_TARGET_BYTE} and byte {UTF32_TARGET_BYTE} — but you found them differently.</b>
              <span>
                One you computed: ({TARGET_CHARACTER_INDEX} − 1) × 4 + 1, without looking at a single byte. The other you had to
                walk, tag by tag, from the beginning. That is what a fixed width buys, and it is worth real money to a program
                that jumps around inside text.
              </span>
            </div>
          </Feedback>
          <button className="primary-button l8-main-action" onClick={onContinue}>Now let time pass →</button>
        </>
      )}
    </div>
  );
}
