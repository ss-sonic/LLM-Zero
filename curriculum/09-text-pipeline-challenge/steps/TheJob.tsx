"use client";

import { Feedback } from "../../../components/ui/Feedback";
import { QuestionPrompt } from "../../../components/ui/QuestionPrompt";
import { PRIOR_SENTENCE, PRIOR_SENTENCE_BYTES, PRIOR_SENTENCE_CHARACTERS, SENTENCE, SENTENCE_CHARACTERS } from "../config";

/**
 * The wager.
 *
 * Nothing is checked here on purpose. The learner commits a number before doing
 * any work and finds out on step 4 whether they were right, which is the whole
 * reason step 4 lands: a bill you predicted is a different experience from a bill
 * you were handed. Lesson 07's sentence is on screen because it has the same
 * number of characters and a different number of bytes.
 */
export function TheJobStep({
  value,
  placed,
  onChange,
  onPlace,
  onContinue,
}: {
  value: string;
  placed: boolean;
  onChange: (value: string) => void;
  onPlace: () => void;
  onContinue: () => void;
}) {
  const guess = Number(value);
  const usable = value.trim() !== "" && Number.isFinite(guess) && guess > 0;

  return (
    <div className="screen-layout centered-screen wide-screen c1-screen">
      <QuestionPrompt
        eyebrow="Step 1 · The job"
        title={<>Nine characters. How many bytes?</>}
        lead={<>No new ideas from here. Every rule you need, you have already built — your job is to turn this exact sentence into the exact bytes a file would hold. Commit to a number before you start.</>}
      />

      <div className="card c1-sentence-card">
        <small>the sentence</small>
        <strong className="c1-sentence">{SENTENCE}</strong>
        <div className="c1-sentence-split" aria-label={`${SENTENCE_CHARACTERS.length} characters`}>
          {SENTENCE_CHARACTERS.map((character, index) => (
            <span key={index}>{character.symbol === " " ? "␣" : character.symbol}</span>
          ))}
        </div>
        <span className="c1-sentence-note">
          French, Chinese and an emoji — three of the five strings Lesson 03 used to prove ASCII could not hold the world&apos;s text.
        </span>
      </div>

      {!placed ? (
        <div className="card c1-wager">
          <p className="c1-decision-question">
            Lesson 07 priced <span className="inline-token">{PRIOR_SENTENCE}</span> at {PRIOR_SENTENCE_BYTES} bytes.
            That sentence has {PRIOR_SENTENCE_CHARACTERS} characters too.
          </p>
          <div className="c1-inline">
            <label htmlFor="wager-input">So how many bytes will this one take in UTF-8?</label>
            <input
              id="wager-input"
              className="c1-input tight"
              type="number"
              min={1}
              value={value}
              onChange={(event) => onChange(event.target.value)}
              placeholder="?"
            />
            <button className="primary-button" disabled={!usable} onClick={onPlace}>Lock it in</button>
          </div>
          <small className="c1-hint">Nothing is scored. You will settle this yourself, four screens from now.</small>
        </div>
      ) : (
        <>
          <Feedback tone="nudge">
            <div className="c1-feedback-copy">
              <b>{guess} bytes. Locked.</b>
              <span>Not checked yet — you are going to work it out rather than be told. First, the order of operations.</span>
            </div>
          </Feedback>
          <button className="primary-button c1-main-action" onClick={onContinue}>What happens first? →</button>
        </>
      )}
    </div>
  );
}
