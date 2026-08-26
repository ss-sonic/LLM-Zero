"use client";

import { Feedback } from "../../../components/ui/Feedback";
import { QuestionPrompt } from "../../../components/ui/QuestionPrompt";
import { BMP_MAX } from "../encodings";
import { COURSE_CHARACTERS } from "../config";
import type { FitMark } from "../types";

export function BetLosesStep({
  marks,
  onCycleMark,
  onContinue,
}: {
  marks: FitMark[];
  onCycleMark: (index: number) => void;
  onContinue: () => void;
}) {
  const expected = COURSE_CHARACTERS.map((entry) => entry.fitsInOneUnit ? "fits" : "too-big");
  const filled = marks.every((mark) => mark !== null);
  const matches = expected.map((value, index) => marks[index] === value);
  const solved = filled && matches.every(Boolean);
  const overflowing = COURSE_CHARACTERS.filter((entry) => !entry.fitsInOneUnit);

  return (
    <div className="screen-layout centered-screen wide-screen l8-screen">
      <QuestionPrompt
        eyebrow="Step 3 · The bet loses"
        title="Years pass. Which of the characters you have already met still fit in one 16-bit unit?"
        lead={<>A single unit holds the values 0 to {BMP_MAX.toLocaleString("en-US")}. Check each code point against that ceiling.</>}
      />

      <div className="card l8-fit-lab">
        {COURSE_CHARACTERS.map((entry, index) => (
          <button
            className={`l8-fit-card${marks[index] ? ` ${marks[index]}` : ""}${filled && !matches[index] ? " wrong" : ""}`}
            key={entry.id}
            onClick={() => onCycleMark(index)}
            aria-label={`${entry.name}, code point ${entry.codePoint}, currently marked ${marks[index] ?? "unmarked"}`}
          >
            <strong>{entry.symbol}</strong>
            <code>{entry.codePoint.toLocaleString("en-US")}</code>
            <small>{marks[index] === "fits" ? "fits" : marks[index] === "too-big" ? "too big" : "?"}</small>
          </button>
        ))}
      </div>
      <p className="l8-hint">Click a character to mark it <b>fits</b> or <b>too big</b>.</p>

      {filled && !solved && (
        <Feedback tone="nudge">
          Compare each number against {BMP_MAX.toLocaleString("en-US")} directly. One of these is not close.
        </Feedback>
      )}

      {solved && (
        <>
          <Feedback tone="mismatch">
            <div>
              <b>{overflowing.map((entry) => entry.symbol).join(" ")} does not fit — and you built it by hand last lesson.</b>
              <span>
                The bet was not wrong about the characters that existed in 1991. It was wrong about the ones that would be added,
                and by the time that was clear, every file, every string in memory and every API on three major platforms already
                assumed a 16-bit unit.
              </span>
            </div>
          </Feedback>
          <p className="l8-turn">
            Widening the unit would break all of it at once — the same obligation that made UTF-8 protect ASCII, now pointing the
            other way. The unit is fixed forever. The characters still have to fit.
          </p>
          <button className="primary-button l8-main-action" onClick={onContinue}>Find room that is not there →</button>
        </>
      )}
    </div>
  );
}
