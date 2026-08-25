import { WEIRD_SHARED_TABLE } from "../config";
import type { AgreementAnswer, MappingTable } from "../types";

export function NumbersMatterStep({
  table,
  weirdApplied,
  tested,
  answer,
  onMakeWeird,
  onTest,
  onAnswer,
  onContinue,
}: {
  table: MappingTable;
  weirdApplied: boolean;
  tested: boolean;
  answer: AgreementAnswer;
  onMakeWeird: () => void;
  onTest: () => void;
  onAnswer: (answer: Exclude<AgreementAnswer, null>) => void;
  onContinue: () => void;
}) {
  return (
    <div className="screen-layout centered-screen wide-screen l2-screen">
      <div className="screen-copy centered-copy compact-copy">
        <p className="eyebrow">Step 5 · Question the numbers</p>
        <h2>Does A need a sensible-looking number?</h2>
        <p className="lead">Your shared table worked. Now replace it with deliberately strange values and test whether communication survives.</p>
      </div>

      <div className="l2-weird-lab card">
        <div className="l2-current-table">
          {(["A", "B", "C"] as const).map((symbol) => <code key={symbol}>{symbol} → {table[symbol]}</code>)}
        </div>
        {!weirdApplied ? (
          <button className="primary-button" onClick={onMakeWeird}>Make the table weird →</button>
        ) : (
          <>
            <p>Both computers now use <strong>A → {WEIRD_SHARED_TABLE.A}, B → {WEIRD_SHARED_TABLE.B}, C → {WEIRD_SHARED_TABLE.C}</strong>.</p>
            {!tested ? (
              <button className="primary-button" onClick={onTest}>Send B as {WEIRD_SHARED_TABLE.B}</button>
            ) : (
              <div className="l2-weird-result"><span>{WEIRD_SHARED_TABLE.B}</span><b>→</b><strong>B ✓</strong></div>
            )}
          </>
        )}
      </div>

      {tested && (
        <div className="l2-question-block">
          <div className="screen-copy centered-copy compact-copy">
            <h2>Why did the strange table still work?</h2>
          </div>
          <div className="binary-choice-row">
            <button className={answer === "intrinsic" ? "big-choice selected" : "big-choice"} onClick={() => onAnswer("intrinsic")}>
              <b>7 naturally means B</b><span>The number itself contains something about the letter.</span>
            </button>
            <button className={answer === "shared" ? "big-choice selected" : "big-choice"} onClick={() => onAnswer("shared")}>
              <b>Both sides agreed</b><span>The exact values can be weird as long as sender and receiver use the same mapping.</span>
            </button>
          </div>
          {answer === "intrinsic" && <div className="feedback nudge">We just changed B from your previous number to 7 and it still worked. That means 7 cannot be naturally attached to B.</div>}
          {answer === "shared" && (
            <div className="feedback success-feedback">
              <div><b>Exactly.</b><span>A shared weird rule beats two different “reasonable” rules.</span></div>
              <button className="primary-button" onClick={onContinue}>Use the table for a real message →</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
