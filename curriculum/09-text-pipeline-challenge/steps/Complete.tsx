"use client";

import Link from "next/link";
import { SENTENCE, SENTENCE_CHARACTERS, SENTENCE_HEX, SENTENCE_TOTALS } from "../config";

export function CompleteStep({ onRestart }: { onRestart: () => void }) {
  return (
    <div className="screen-layout complete-screen c1-complete-screen">
      <div className="completion-mark">✓</div>
      <p className="eyebrow">Challenge complete · Module 01 finished</p>
      <h2>Text is a chain of agreements, and you can now walk all of it.</h2>
      <p className="lead completion-lead">
        A symbol is something humans recognise. A code point is a number the world agreed identifies it. An encoding is a
        separate rule for turning that number into bytes, and bytes carry no label saying which rule made them. Nothing in
        that chain is a fact about computers — every link is a decision somebody made, and you have now made all of them
        yourself.
      </p>

      <div className="c1-final" aria-label={`${SENTENCE} from symbols to bytes`}>
        <div><small>symbols</small><strong>{SENTENCE}</strong><span>{SENTENCE_TOTALS.characters} characters</span></div>
        <span>→</span>
        <div>
          <small>code points</small>
          <code>{SENTENCE_CHARACTERS.map((character) => character.notation).join(" ")}</code>
          <span>identity, agreed</span>
        </div>
        <span>→</span>
        <div>
          <small>UTF-8 bytes</small>
          <code>{SENTENCE_HEX.join(" ")}</code>
          <span>{SENTENCE_TOTALS.utf8} bytes, tagged</span>
        </div>
      </div>

      <div className="c1-earned">
        <div><small>composed</small><b>You laid out the pipeline before using it, and never had to be told which stage you were on again.</b></div>
        <div><small>built</small><b>Three bytes by hand for 你, the UTF-8 form the lessons derived but never made you produce.</b></div>
        <div><small>reversed</small><b>You read characters out of a stream you had never seen, with no length and no separators sent beside it.</b></div>
        <div><small>diagnosed</small><b>You found the fault in a file where every byte was correct — the reader had guessed the rule.</b></div>
      </div>

      <div className="c1-solved-open">
        <div><small>settled</small><b>A character count never determined a byte count, and no encoding is simply best. {SENTENCE_TOTALS.utf8} bytes in UTF-8, {SENTENCE_TOTALS.utf16} in UTF-16, {SENTENCE_TOTALS.utf32} in UTF-32 — same sentence, three honest answers.</b></div>
        <div><small>next problem</small><b>A model cannot learn from {SENTENCE_TOTALS.utf8} raw bytes any more than from nine letters. Something has to decide what counts as one piece of text — and it is not the character.</b></div>
      </div>

      <div className="next-lesson-card pending">
        <div>
          <small>Next module</small>
          <h3>Text becomes model input</h3>
          <p>Why feeding raw characters to a model does not work, what a token actually is, and how to build a tokenizer from scratch.</p>
        </div>
        <span className="c1-pending-badge">Being written</span>
      </div>

      <p className="c1-review-note">
        These ideas will come back at <Link href="/review" className="c1-review-link">/review</Link> a day from now, and then
        at widening gaps. Retrieving them a week later is what turns this into something you still have next year.
      </p>

      <div className="c1-complete-actions">
        <Link href="/" className="primary-button">Back to course map</Link>
        <button className="text-link-button" onClick={onRestart}>Replay this challenge</button>
      </div>
    </div>
  );
}
