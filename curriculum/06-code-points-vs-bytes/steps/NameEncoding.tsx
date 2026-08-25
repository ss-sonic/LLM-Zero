"use client";

import { QuestionPrompt } from "../../../components/ui/QuestionPrompt";
import { LATIN_A, ROCKET, TOY_RULE_NAME, TOY_WIDTH } from "../config";
import { encodeFixed } from "../encoding";

const LAYERS = [
  { entry: LATIN_A, bytes: encodeFixed(LATIN_A.codePoint, TOY_WIDTH) },
  { entry: ROCKET, bytes: encodeFixed(ROCKET.codePoint, TOY_WIDTH) },
];

export function NameEncodingStep({
  revealed,
  onReveal,
  onContinue,
}: {
  revealed: boolean;
  onReveal: () => void;
  onContinue: () => void;
}) {
  return (
    <div className="screen-layout centered-screen wide-screen l6-screen">
      <QuestionPrompt
        eyebrow="Step 6 · Name the idea"
        title="The missing piece has a name."
        lead="You invented a rule, changed it, and then broke a message by disagreeing about it. That rule is a real concept with a real name."
      />

      {!revealed ? (
        <button className="primary-button l6-main-action" onClick={onReveal}>Name it →</button>
      ) : (
        <>
          <div className="l6-term-card card">
            <small>New term</small>
            <strong>encoding</strong>
            <p>a rule for turning character identities into concrete units such as bytes, and for recovering those identities from the bytes again</p>
            <span>{TOY_RULE_NAME} is an encoding. So is the four-byte rule. Neither is the encoding.</span>
          </div>

          <div className="l6-layer-stack" aria-label="The layers from character to bits">
            {LAYERS.map(({ entry, bytes }) => (
              <div className="l6-layer-column" key={entry.symbol}>
                <div className="l6-layer-node"><small>character</small><strong>{entry.symbol}</strong></div>
                <div className="l6-layer-arrow"><span>Unicode</span><b>↓</b><em>which character is this?</em></div>
                <div className="l6-layer-node"><small>code point</small><code>{entry.notation}</code></div>
                <div className="l6-layer-arrow"><span>encoding</span><b>↓</b><em>which bytes stand for it?</em></div>
                <div className="l6-layer-node"><small>bytes ({TOY_RULE_NAME})</small><div className="l6-layer-bytes">{bytes?.map((byte, index) => <code key={index}>{byte}</code>)}</div></div>
                <div className="l6-layer-arrow"><span>binary</span><b>↓</b><em>fixed positional math</em></div>
                <div className="l6-layer-node"><small>bits</small><code className="l6-bit-string">{bytes?.map((byte) => byte.toString(2).padStart(8, "0")).join(" ")}</code></div>
              </div>
            ))}
          </div>

          <p className="quiet-copy l6-caveat">
            Only one of those three arrows was ever free to be different. Unicode is an agreement, the encoding is an agreement — but once bytes are chosen,
            turning them into bits is the positional math from Lesson 01, and no one gets to vote on it.
          </p>

          <details className="l6-side-note">
            <summary>Is an encoding really one single step?</summary>
            <p>
              Not in Unicode&apos;s own vocabulary. It separates an <strong>encoding form</strong>, which maps code points to code units, from an
              <strong> encoding scheme</strong>, which turns those units into an actual byte sequence — including which end goes first. We are treating
              both as one rule while the distinction would not yet earn its keep, and we will separate them when it starts to matter.
            </p>
          </details>

          <details className="l6-side-note">
            <summary>Is {TOY_RULE_NAME} a real encoding people use?</summary>
            <p>
              No. We invented it in this lesson so that the byte sequence would obviously be a choice rather than a discovery. Real Unicode encodings exist,
              and the next lessons build one properly. Do not go looking for {TOY_RULE_NAME} anywhere outside LLM Zero.
            </p>
          </details>

          <button className="primary-button l6-main-action" onClick={onContinue}>Use the rule in both directions →</button>
        </>
      )}
    </div>
  );
}
