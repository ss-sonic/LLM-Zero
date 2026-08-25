"use client";

import { ASCII_LANDMARKS } from "../config";

export function MeetAsciiStep({
  revealed,
  onReveal,
  onContinue,
}: {
  revealed: boolean;
  onReveal: () => void;
  onContinue: () => void;
}) {
  return (
    <div className="screen-layout centered-screen wide-screen l3-screen">
      <div className="screen-copy centered-copy compact-copy">
        <p className="eyebrow">Step 3 · Meet a real standard</p>
        <h2>Engineers needed the same idea you just built.</h2>
        <p className="lead">One early shared rulebook for text became known as <strong>ASCII</strong>: the American Standard Code for Information Interchange.</p>
      </div>

      {!revealed ? (
        <button className="primary-button l3-main-action" onClick={onReveal}>Open the ASCII rulebook →</button>
      ) : (
        <>
          <div className="l3-ascii-facts">
            <div><small>Code size</small><strong>7 bits</strong><span>seven binary positions</span></div>
            <div><small>Possible values</small><strong>128</strong><span>numbers 0 through 127</span></div>
            <div><small>Main purpose</small><strong>Agreement</strong><span>the same values mean the same things</span></div>
          </div>

          <div className="l3-landmarks card" aria-label="Small slice of ASCII">
            <small>A few landmarks from the table</small>
            <div className="l3-landmark-grid">
              {ASCII_LANDMARKS.map((item) => (
                <div key={`${item.label}-${item.value}`}>
                  <span>{item.label}</span><b>→</b><code>{item.value}</code>
                </div>
              ))}
            </div>
          </div>

          <details className="l3-side-note">
            <summary>Are all 128 ASCII values visible characters?</summary>
            <p>No. Values 0–31 and 127 are control codes rather than ordinary printable symbols. Printable ASCII mostly lives from 32 (space) through 126 (~). We will keep our attention on the visible character mapping.</p>
          </details>

          <button className="primary-button l3-main-action" onClick={onContinue}>Why is A exactly 65? →</button>
        </>
      )}
    </div>
  );
}
