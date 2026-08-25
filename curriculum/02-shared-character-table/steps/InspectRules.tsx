import { RECEIVER_PRIVATE_TABLE, SENDER_PRIVATE_TABLE } from "../config";
import type { MismatchReason } from "../types";

const rows = ["A", "B", "C"] as const;

export function InspectRulesStep({
  answer,
  onAnswer,
  onContinue,
}: {
  answer: MismatchReason;
  onAnswer: (answer: Exclude<MismatchReason, null>) => void;
  onContinue: () => void;
}) {
  return (
    <div className="screen-layout centered-screen wide-screen l2-screen">
      <div className="screen-copy centered-copy compact-copy">
        <p className="eyebrow">Step 2 · Inspect the rules</p>
        <h2>Why did Computer 2 show B?</h2>
        <p className="lead">Trace the evidence before choosing: <strong>12</strong> left Computer 1, and <strong>12</strong> arrived at Computer 2. Now compare the two private tables.</p>
      </div>

      <div className="l2-table-compare">
        <div className="l2-table-card card">
          <small>Computer 1&apos;s private table</small>
          {rows.map((symbol) => (
            <div className={SENDER_PRIVATE_TABLE[symbol] === 12 ? "l2-map-row highlight" : "l2-map-row"} key={symbol}>
              <b>{symbol}</b><span>→</span><code>{SENDER_PRIVATE_TABLE[symbol]}</code>
            </div>
          ))}
        </div>
        <div className="l2-table-card card">
          <small>Computer 2&apos;s private table</small>
          {rows.map((symbol) => (
            <div className={RECEIVER_PRIVATE_TABLE[symbol] === 12 ? "l2-map-row highlight" : "l2-map-row"} key={symbol}>
              <b>{symbol}</b><span>→</span><code>{RECEIVER_PRIVATE_TABLE[symbol]}</code>
            </div>
          ))}
        </div>
      </div>

      <div className="l2-question-block">
        <p className="question-label">Choose the explanation that fits what you just inspected.</p>
        <div className="binary-choice-row">
          <button className={answer === "changed" ? "big-choice selected" : "big-choice"} onClick={() => onAnswer("changed")}>
            <b>The number changed</b><span>12 somehow became a different number while travelling.</span>
          </button>
          <button className={answer === "rules" ? "big-choice selected" : "big-choice"} onClick={() => onAnswer("rules")}>
            <b>The tables disagree</b><span>Computer 1 reads 12 as A. Computer 2 reads 12 as B.</span>
          </button>
        </div>
        {answer === "changed" && <div className="feedback nudge">Trace the packet again: it was 12 at the sender and 12 at the receiver. Nothing happened to the number.</div>}
        {answer === "rules" && (
          <div className="feedback success-feedback">
            <div><b>Exactly. The number did not change. The interpretation did.</b><span>A representation only works between systems when they share the rule used to interpret it.</span></div>
            <button className="primary-button" onClick={onContinue}>Try to fix it →</button>
          </div>
        )}
      </div>
    </div>
  );
}
