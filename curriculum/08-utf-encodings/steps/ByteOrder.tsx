"use client";

import { Feedback } from "../../../components/ui/Feedback";
import { QuestionPrompt } from "../../../components/ui/QuestionPrompt";
import { TextRecall, type RecallAssessment } from "../../../components/ui/TextRecall";
import { ORDER_EXAMPLE } from "../config";
import { bytesToUnit, toHex } from "../encodings";
import type { ByteOrder } from "../types";

const ORDERS: { id: ByteOrder; label: string; detail: string }[] = [
  { id: "big", label: "High byte first", detail: "00 then E9" },
  { id: "little", label: "Low byte first", detail: "E9 then 00" },
];

/**
 * Lesson 02's problem, one level down.
 *
 * There the two machines disagreed about what a number meant. Here they agree
 * perfectly about that and disagree about the order the number's own bytes are
 * written in — a disagreement that only becomes possible once a unit is wider
 * than a byte.
 */
export function ByteOrderStep({
  seen,
  recallText,
  recallCommitted,
  recallAssessment,
  onTryOrder,
  onRecallChange,
  onRecallCommit,
  onRecallAssess,
  onRecallRewrite,
  onContinue,
}: {
  seen: ByteOrder[];
  recallText: string;
  recallCommitted: boolean;
  recallAssessment: RecallAssessment;
  onTryOrder: (order: ByteOrder) => void;
  onRecallChange: (value: string) => void;
  onRecallCommit: () => void;
  onRecallAssess: (assessment: Exclude<RecallAssessment, null>) => void;
  onRecallRewrite: () => void;
  onContinue: () => void;
}) {
  const bothSeen = ORDERS.every((order) => seen.includes(order.id));
  const latest = seen.at(-1) ?? null;
  const read = latest ? bytesToUnit([...ORDER_EXAMPLE.bytes], "big") : null;
  const readAs = latest === "little" ? ORDER_EXAMPLE.reversedUnit : read;

  return (
    <div className="screen-layout centered-screen wide-screen l8-screen">
      <QuestionPrompt
        eyebrow="Step 6 · Which byte first?"
        title="A unit is two bytes wide. Which of them travels first?"
        lead={<>The sender stores <span className="inline-token">{ORDER_EXAMPLE.symbol}</span> as the single unit {ORDER_EXAMPLE.notation}. Memory and wires only carry bytes, so that unit has to be taken apart — and there are two ways to do it.</>}
      />

      <div className="card l8-order-lab">
        <div className="l8-order-source">
          <div><small>the character</small><strong>{ORDER_EXAMPLE.symbol}</strong></div>
          <span>→</span>
          <div><small>one 16-bit unit</small><code>{toHex(ORDER_EXAMPLE.unit, 4)}</code></div>
          <span>→</span>
          <div><small>two bytes</small><code>{ORDER_EXAMPLE.bytes.map((byte) => toHex(byte, 2)).join(" ")}</code></div>
        </div>

        <div className="l8-order-buttons">
          {ORDERS.map((order) => (
            <button
              className={`l8-order-button${latest === order.id ? " active" : ""}${seen.includes(order.id) ? " seen" : ""}`}
              key={order.id}
              onClick={() => onTryOrder(order.id)}
            >
              <b>{order.label}</b>
              <span>{order.detail}</span>
            </button>
          ))}
        </div>

        {latest && (
          <div className={`l8-order-result${latest === "little" ? " broken" : ""}`} aria-live="polite">
            <div><small>bytes on the wire</small><code>{(latest === "big" ? ORDER_EXAMPLE.bytes : [...ORDER_EXAMPLE.bytes].reverse()).map((byte) => toHex(byte, 2)).join(" ")}</code></div>
            <span>→ a receiver that assumes high byte first reads →</span>
            <div>
              <small>code point</small>
              <code>U+{toHex(readAs ?? 0, 4)}</code>
              <b>{latest === "little" ? "a private-use code point — no standard character at all" : ORDER_EXAMPLE.symbol}</b>
            </div>
          </div>
        )}

        {!bothSeen && <p className="l8-hint">Try both orders before moving on.</p>}
      </div>

      {bothSeen && (
        <div className="l8-recall-block">
          <h2 className="l8-decision-question">Both machines agree about Unicode. They still cannot read each other. What did Lesson 02 prove?</h2>
          <TextRecall
            label="Commit your answer before the principle appears."
            value={recallText}
            placeholder="One sentence is enough."
            principle="Agreeing on what a number means is not enough — sender and receiver must also share the rule that turns that number into the bytes on the wire, and back. Here they share the character table perfectly and still disagree about which byte of a unit comes first, so identical bytes arrive and become a different character."
            committed={recallCommitted}
            assessment={recallAssessment}
            onChange={onRecallChange}
            onCommit={onRecallCommit}
            onAssess={onRecallAssess}
            onRewrite={onRecallRewrite}
          />

          {recallAssessment !== null && (
            <>
              <div className="l8-immunity">
                <div><small>UTF-16 and UTF-32</small><b>Must declare a byte order.</b><span>Both exist in two flavours, and files often open with a marker whose only job is to say which one this is.</span></div>
                <div className="l8-immunity-key"><small>UTF-8</small><b>Cannot have the problem.</b><span>Its unit is one byte. There is exactly one way to order one byte, so there is nothing for two machines to disagree about.</span></div>
              </div>
              <button className="primary-button l8-main-action" onClick={onContinue}>Build the rocket the other way →</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
