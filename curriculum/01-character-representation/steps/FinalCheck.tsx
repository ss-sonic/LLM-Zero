"use client";

import { Feedback } from "../../../components/ui/Feedback";
import { QuestionPrompt } from "../../../components/ui/QuestionPrompt";
import { BYTE_PLACE_VALUES, bitsToNumber, toBits } from "../../../lib/lesson/binary";

const RECEIVER_SYMBOL = "Z";

/**
 * Lesson completion is a construction, not a recognition check.
 *
 * Asking "does the computer really store the letter A?" with a Yes/No pair lets a
 * learner pass by picking the more careful-sounding card. Here they have to build
 * the stored byte themselves and then work out the receiver's rule from the bits,
 * which cannot be answered by reading the question's tone.
 */
export function FinalCheckStep({
  agreedNumber,
  proofBits,
  receiverRule,
  onToggleProofBit,
  onReceiverRuleChange,
  onContinue,
}: {
  agreedNumber: number;
  proofBits: string[];
  receiverRule: string;
  onToggleProofBit: (index: number) => void;
  onReceiverRuleChange: (value: string) => void;
  onContinue: () => void;
}) {
  const storedNumber = bitsToNumber(proofBits);
  const targetBits = toBits(agreedNumber);
  const bitsBuilt = storedNumber === agreedNumber;
  const difference = agreedNumber - storedNumber;

  const ruleTouched = receiverRule.trim() !== "";
  const ruleNumber = Number(receiverRule);
  const ruleCorrect = ruleTouched && Number.isFinite(ruleNumber) && Math.round(ruleNumber) === agreedNumber;
  const solved = bitsBuilt && ruleCorrect;

  return (
    <div className="screen-layout centered-screen wide-screen l1-proof-screen">
      <QuestionPrompt
        eyebrow="Step 6 · Prove the idea"
        title={<>Is the letter A hiding inside the stored bits?</>}
        lead={<>You agreed on <span className="inline-token">A → {agreedNumber}</span>. Reconstruct what Computer 1 puts in memory, then work out what the machine at the other end must believe.</>}
      />

      <div className="card l1-proof-lab">
        <div className="l1-proof-task">
          <small>Task 1 · sender</small>
          <p>Set the eight switches to exactly what Computer 1 stores for <b>A</b>.</p>
          <div className="l1-place-values" aria-hidden="true">
            {BYTE_PLACE_VALUES.map((value) => <span key={value}>{value}</span>)}
          </div>
          <div className="l1-proof-bits" aria-label={`Stored pattern ${proofBits.join("")}, total ${storedNumber}`}>
            {proofBits.map((bit, index) => (
              <button
                key={index}
                className={bit === "1" ? "l1-proof-bit on" : "l1-proof-bit"}
                onClick={() => onToggleProofBit(index)}
                aria-label={`${bit === "1" ? "Remove" : "Add"} ${BYTE_PLACE_VALUES[index]}, currently ${bit}`}
              >{bit}</button>
            ))}
          </div>
          <div className="l1-proof-total" aria-live="polite">
            <code>{proofBits.join("")}</code><b>=</b><strong className={bitsBuilt ? "solved" : ""}>{storedNumber}</strong>
          </div>
          {!bitsBuilt && (
            <p className="l1-proof-hint">
              {difference > 0 ? `${difference} short of ${agreedNumber}.` : `${Math.abs(difference)} over ${agreedNumber}.`}
            </p>
          )}
          {bitsBuilt && <p className="l1-proof-hint solved">That is the whole of what Computer 1 has in memory: {targetBits.join("")}.</p>}
        </div>

        {bitsBuilt && (
          <div className="l1-proof-task l1-proof-twist">
            <small>Task 2 · receiver</small>
            <h3 className="l1-proof-question">Those exact bits arrive at Computer 2, which shows {RECEIVER_SYMBOL}. What rule is it using?</h3>
            <div className="l1-proof-rule">
              <span className="l1-proof-symbol">{RECEIVER_SYMBOL}</span>
              <span>→</span>
              <input
                className="number-input"
                type="number"
                min="0"
                max="255"
                value={receiverRule}
                onChange={(event) => onReceiverRuleChange(event.target.value)}
                aria-label={`The number Computer 2 maps ${RECEIVER_SYMBOL} to`}
                placeholder="?"
              />
            </div>
            {ruleTouched && !ruleCorrect && (
              <Feedback tone="nudge">
                Nothing was changed on the wire. Computer 2 is reading the same pattern you just built — which number do those switches add up to?
              </Feedback>
            )}
          </div>
        )}
      </div>

      {solved && (
        <>
          <div className="l1-proof-verdict" aria-label="One pattern, two characters">
            <div><small>Computer 1 shows</small><strong>A</strong><code>A → {agreedNumber}</code></div>
            <div className="l1-proof-shared"><small>Identical in memory</small><code>{targetBits.join("")}</code></div>
            <div><small>Computer 2 shows</small><strong>{RECEIVER_SYMBOL}</strong><code>{RECEIVER_SYMBOL} → {agreedNumber}</code></div>
          </div>
          <Feedback tone="success">
            <div>
              <b>The same bits, two different characters.</b>
              <span>Nothing about the letter A survives inside the pattern. The bits are a representation; the rule applied to them decides what is read back.</span>
            </div>
          </Feedback>
          <button className="primary-button l1-proof-action" onClick={onContinue}>Finish lesson →</button>
        </>
      )}
    </div>
  );
}
