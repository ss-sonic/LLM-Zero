"use client";

import { UNICODE_EXAMPLES } from "../config";
import { toUnicodeNotation } from "../unicode";

export function MeetUnicodeStep({
  revealed,
  onReveal,
  onContinue,
}: {
  revealed: boolean;
  onReveal: () => void;
  onContinue: () => void;
}) {
  return (
    <div className="screen-layout centered-screen wide-screen l5-screen">
      <div className="screen-copy centered-copy compact-copy">
        <p className="eyebrow">Step 4 · Meet Unicode</p>
        <h2>Humans built the global agreement you just described.</h2>
        <p className="lead">A much larger standard assigns stable code points across writing systems, symbols, controls, and more. Its name is <strong>Unicode</strong>.</p>
      </div>

      {!revealed ? (
        <button className="primary-button l5-main-action" onClick={onReveal}>Open the Unicode map →</button>
      ) : (
        <>
          <div className="l5-unicode-facts">
            <div><small>Standard</small><strong>Unicode</strong><span>one shared global codespace</span></div>
            <div><small>Codespace</small><strong>U+0000 → U+10FFFF</strong><span>numbered positions available to the standard</span></div>
            <div><small>Key idea</small><strong>Identity</strong><span>assigned characters keep agreed code points</span></div>
          </div>

          <div className="l5-real-table card">
            <small>A few real Unicode assignments</small>
            <div className="l5-real-grid">
              {UNICODE_EXAMPLES.map((example) => (
                <div key={example.id}>
                  <strong>{example.symbol}</strong>
                  <code>{toUnicodeNotation(example.decimal)}</code>
                  <span>{example.decimal.toLocaleString("en-US")}</span>
                  <small>{example.name}</small>
                </div>
              ))}
            </div>
          </div>

          <details className="l5-side-note">
            <summary>Does every code point contain a character?</summary>
            <p>No. Unicode&apos;s codespace also contains reserved positions, noncharacters, surrogate code points, and other categories. For this lesson, focus on the code points that are assigned to the characters we are inspecting.</p>
          </details>

          <details className="l5-side-note">
            <summary>Does one visible symbol always equal one code point?</summary>
            <p>No. Real text can combine multiple code points into what a person perceives as one visible character, and some emoji are sequences too. Our examples here are intentionally simple so we can isolate the idea of character identity first.</p>
          </details>

          <button className="primary-button l5-main-action" onClick={onContinue}>What does U+1F680 mean? →</button>
        </>
      )}
    </div>
  );
}
