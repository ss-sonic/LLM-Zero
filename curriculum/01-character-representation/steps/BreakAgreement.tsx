"use client";

import { Feedback } from "../../../components/ui/Feedback";

export function BreakAgreementStep({
  agreedNumber,
  sendRevealed,
  onSend,
  onContinue,
}: {
  agreedNumber: number;
  sendRevealed: boolean;
  onSend: () => void;
  onContinue: () => void;
}) {
  const receiverSymbol = "G";

  return (
    <div className="screen-layout centered-screen wide-screen">
      <div className="screen-copy centered-copy compact-copy">
        <p className="eyebrow">Step 4 · Two computers</p>
        <h2>What if they agree on the number, but disagree on what it means?</h2>
        <p className="lead">Computer 1 invented <strong>A → {agreedNumber}</strong>. Computer 2 independently invented <strong>{receiverSymbol} → {agreedNumber}</strong>.</p>
      </div>

      <div className="computer-experiment">
        <div className="computer card">
          <span className="computer-title">Computer 1 · sender</span>
          <div className="screen">
            <span className="screen-symbol">A</span>
            <code>A → {agreedNumber}</code>
          </div>
        </div>

        <div className="transmission">
          <span className="packet">{agreedNumber}</span>
          <span className="wire-line">→</span>
          <small>Only the number travels</small>
        </div>

        <div className="computer card">
          <span className="computer-title">Computer 2 · receiver</span>
          <div className="screen receiver-screen">
            <span className="screen-symbol">{sendRevealed ? receiverSymbol : "?"}</span>
            <code>{receiverSymbol} → {agreedNumber}</code>
          </div>
        </div>
      </div>

      {!sendRevealed ? (
        <button className="primary-button experiment-button" onClick={onSend}>Send {agreedNumber} →</button>
      ) : (
        <Feedback tone="mismatch">
          <div>
            <b>Computer 2 reads {receiverSymbol}, not A.</b>
            <span>The same number can mean different things under different rules. Communication works only when the interpretation is shared.</span>
          </div>
          <button className="primary-button" onClick={onContinue}>So what gets stored? →</button>
        </Feedback>
      )}
    </div>
  );
}
