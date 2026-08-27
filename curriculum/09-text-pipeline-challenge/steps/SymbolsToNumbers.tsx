"use client";

import { Feedback } from "../../../components/ui/Feedback";
import { QuestionPrompt } from "../../../components/ui/QuestionPrompt";
import { StreamStrip } from "../StreamStrip";
import { ASCII_ANCHORS, CHARACTER_DATABASE, SENTENCE_CHARACTERS } from "../config";
import { codePointMatches } from "../pipeline";

const ASCII_COUNT = SENTENCE_CHARACTERS.filter((entry) => entry.isAscii).length;
const LOOKUP_COUNT = SENTENCE_CHARACTERS.length - ASCII_COUNT;

/**
 * Stage two of the learner's own pipeline: identity.
 *
 * The check is not "can you read a table". Five of these code points follow from
 * ASCII's consecutive runs and Lesson 05's carry-over, and four of them do not
 * follow from anything — they are facts in a database. Knowing which is which is
 * the part that transfers, so the database is available and deliberately does not
 * list the five.
 */
export function SymbolsToNumbersStep({
  values,
  databaseOpen,
  onChange,
  onOpenDatabase,
  onContinue,
}: {
  values: string[];
  databaseOpen: boolean;
  onChange: (index: number, value: string) => void;
  onOpenDatabase: () => void;
  onContinue: () => void;
}) {
  const matches = SENTENCE_CHARACTERS.map((character, index) => codePointMatches(values[index] ?? "", character.codePoint));
  const touched = SENTENCE_CHARACTERS.map((_, index) => (values[index] ?? "").trim() !== "");
  const solved = matches.every(Boolean);

  const wrongAscii = SENTENCE_CHARACTERS.some((character, index) => character.isAscii && touched[index] && !matches[index]);
  const wrongLookup = SENTENCE_CHARACTERS.some((character, index) => !character.isAscii && touched[index] && !matches[index]);

  return (
    <div className="screen-layout centered-screen wide-screen c1-screen">
      <QuestionPrompt
        eyebrow="Step 3 · Symbols to numbers"
        title={<>Nine symbols. What number identifies each one?</>}
        lead={<>{ASCII_COUNT} of them you can work out from what ASCII published. The other {LOOKUP_COUNT} do not follow from anything — they are entries in a database. Decimal or <span className="inline-token">U+</span> notation, either is the same number.</>}
      />

      <div className="c1-reference">
        <div className="c1-anchors">
          <small>ASCII anchors · Lesson 03</small>
          <div>
            {ASCII_ANCHORS.map((anchor) => (
              <span key={anchor.label}><b>{anchor.label}</b> = {anchor.value}</span>
            ))}
          </div>
          <span className="c1-anchor-note">Each run is consecutive from its anchor, and Unicode kept all 128 of them unchanged.</span>
        </div>

        <div className="c1-database">
          <small>character database</small>
          {databaseOpen ? (
            <ul>
              {CHARACTER_DATABASE.map((entry) => (
                <li key={entry.symbol}>
                  <strong>{entry.symbol}</strong>
                  <code>{entry.notation}</code>
                  <span>{entry.name}</span>
                </li>
              ))}
            </ul>
          ) : (
            <>
              <button className="secondary-button" onClick={onOpenDatabase}>Look up the {LOOKUP_COUNT} I cannot derive</button>
              <span className="c1-anchor-note">Nobody derives 你&apos;s number. Looking it up is the correct move, not a defeat.</span>
            </>
          )}
        </div>
      </div>

      <div className="card c1-table-lab">
        {SENTENCE_CHARACTERS.map((character, index) => (
          <div className="c1-row" key={index}>
            <strong className={character.symbol === " " ? "c1-space" : ""}>
              {character.symbol === " " ? "␣" : character.symbol}
            </strong>
            <small>{character.isAscii ? "ASCII" : "look up"}</small>
            <input
              className={`c1-input row${matches[index] ? " right" : ""}${touched[index] && !matches[index] ? " wrong" : ""}`}
              value={values[index] ?? ""}
              onChange={(event) => onChange(index, event.target.value)}
              aria-label={`Code point for ${character.label}`}
              placeholder="?"
            />
          </div>
        ))}
      </div>

      {wrongAscii && !solved && (
        <Feedback tone="nudge">
          The uppercase run starts at A = 65 and the lowercase run at a = 97, both consecutive. Count from the anchor rather than guessing — and remember Unicode carried those exact numbers over unchanged.
        </Feedback>
      )}

      {wrongLookup && !solved && !wrongAscii && (
        <Feedback tone="nudge">
          Those four are not derivable from anything you know. That is what the character database is for — open it.
        </Feedback>
      )}

      {solved && (
        <>
          <StreamStrip mode="identity" caption="Identities resolved" />
          <Feedback tone="success">
            <div className="c1-feedback-copy">
              <b>Nine characters, nine agreed numbers.</b>
              <span>None of this has decided a single byte yet. Identity and storage are still two different questions.</span>
            </div>
          </Feedback>
          <button className="primary-button c1-main-action" onClick={onContinue}>Now settle the bill →</button>
        </>
      )}
    </div>
  );
}
