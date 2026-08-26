"use client";

import { Feedback } from "../../../components/ui/Feedback";
import { QuestionPrompt } from "../../../components/ui/QuestionPrompt";
import { CJK_TEXT, COMPARISONS } from "../config";
import { encodeText } from "../../07-utf-8/utf8";
import { utf16ByteLength } from "../encodings";

const CJK_UTF8 = encodeText(CJK_TEXT).length;
const CJK_UTF16 = utf16ByteLength(CJK_TEXT);

/**
 * The screen that stops the lesson collapsing into "UTF-8 always wins".
 *
 * It does not, and the learner proves that themselves on a string where UTF-16
 * is genuinely smaller. A comparison the learner cannot lose is not a comparison.
 */
export function WhichWouldYouUseStep({
  utf8Value,
  utf16Value,
  onUtf8Change,
  onUtf16Change,
  onContinue,
}: {
  utf8Value: string;
  utf16Value: string;
  onUtf8Change: (value: string) => void;
  onUtf16Change: (value: string) => void;
  onContinue: () => void;
}) {
  const filled = utf8Value.trim() !== "" && utf16Value.trim() !== "";
  const utf8Solved = Number(utf8Value) === CJK_UTF8;
  const utf16Solved = Number(utf16Value) === CJK_UTF16;
  const solved = utf8Solved && utf16Solved;

  return (
    <div className="screen-layout centered-screen wide-screen l8-screen">
      <QuestionPrompt
        eyebrow="Step 8 · Which would you use?"
        title={<>Price <span className="inline-token">{CJK_TEXT}</span> both ways before you answer that.</>}
        lead="Two characters, both in the range UTF-8 spends three bytes on, and both inside a single UTF-16 unit. Use the band table you built last lesson."
      />

      <div className="card l8-price-lab">
        <div className="l8-price-row">
          <div><small>UTF-8</small><span>1–4 bytes, tagged</span></div>
          <input
            className={`l8-input small${utf8Solved ? " right" : ""}${filled && !utf8Solved ? " wrong" : ""}`}
            type="number"
            min={1}
            value={utf8Value}
            onChange={(event) => onUtf8Change(event.target.value)}
            aria-label={`Bytes for ${CJK_TEXT} in UTF-8`}
            placeholder="?"
          />
          <small>bytes</small>
        </div>
        <div className="l8-price-row">
          <div><small>UTF-16</small><span>2 or 4 bytes, one unit each here</span></div>
          <input
            className={`l8-input small${utf16Solved ? " right" : ""}${filled && !utf16Solved ? " wrong" : ""}`}
            type="number"
            min={1}
            value={utf16Value}
            onChange={(event) => onUtf16Change(event.target.value)}
            aria-label={`Bytes for ${CJK_TEXT} in UTF-16`}
            placeholder="?"
          />
          <small>bytes</small>
        </div>

        {filled && !solved && (
          <Feedback tone="nudge">
            Both characters sit between U+0800 and U+FFFF. That is three bytes each in UTF-8, and one two-byte unit each in UTF-16.
          </Feedback>
        )}
      </div>

      {solved && (
        <>
          <Feedback tone="success">
            <div>
              <b>UTF-16 is smaller here — {CJK_UTF16} bytes against {CJK_UTF8}.</b>
              <span>UTF-8 is not universally more compact. It wins enormously on ASCII-heavy text and loses across most of the CJK range, which is exactly the text UTF-16 was designed around.</span>
            </div>
          </Feedback>

          <div className="l8-table" role="table" aria-label="Bytes per encoding for four sample strings">
            <div className="l8-table-head" role="row">
              <span role="columnheader">text</span>
              <span role="columnheader">chars</span>
              <span role="columnheader">UTF-8</span>
              <span role="columnheader">UTF-16</span>
              <span role="columnheader">UTF-32</span>
            </div>
            {COMPARISONS.map((entry) => {
              const best = Math.min(entry.utf8, entry.utf16, entry.utf32);
              return (
                <div className="l8-table-row" role="row" key={entry.text}>
                  <span role="cell"><code>{entry.text}</code></span>
                  <span role="cell">{entry.characters}</span>
                  <span role="cell" className={entry.utf8 === best ? "best" : ""}>{entry.utf8}</span>
                  <span role="cell" className={entry.utf16 === best ? "best" : ""}>{entry.utf16}</span>
                  <span role="cell" className={entry.utf32 === best ? "best" : ""}>{entry.utf32}</span>
                </div>
              );
            })}
          </div>

          <div className="l8-uses">
            <div><small>UTF-8</small><b>Interchange, almost everywhere.</b><span>Compact for ASCII, needs no byte order, survives a lost byte, and every ASCII file is already valid. It is the default for the web, source code and protocols.</span></div>
            <div><small>UTF-16</small><b>In memory, on platforms that bet early.</b><span>Windows, Java and JavaScript expose strings as 16-bit units, so their APIs count length in units — which is why an emoji often counts as two.</span></div>
            <div><small>UTF-32</small><b>Rarely stored, occasionally processed.</b><span>Four bytes for the letter A is a hard price for files, but a fixed width makes character indexing arithmetic instead of a walk.</span></div>
          </div>

          <button className="primary-button l8-main-action" onClick={onContinue}>Finish Lesson 08 →</button>
        </>
      )}
    </div>
  );
}
