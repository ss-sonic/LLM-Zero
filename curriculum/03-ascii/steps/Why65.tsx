"use client";

import { ChoiceCard } from "../../../components/ui/ChoiceCard";
import { Feedback } from "../../../components/ui/Feedback";
import { toByteBinary, toSevenBit } from "../ascii";
import type { Why65Answer } from "../types";

export function Why65Step({
  answer,
  onAnswer,
  onContinue,
}: {
  answer: Why65Answer;
  onAnswer: (answer: Exclude<Why65Answer, null>) => void;
  onContinue: () => void;
}) {
  return (
    <div className="screen-layout centered-screen wide-screen l3-screen">
      <div className="screen-copy centered-copy compact-copy">
        <p className="eyebrow">Step 4 · Convention vs math</p>
        <h2>Why does ASCII say A → 65?</h2>
        <p className="lead">You already know that a number can represent a character. Now decide what makes this particular number true.</p>
      </div>

      <div className="l3-choice-grid">
        <ChoiceCard variant="large" selected={answer === "shape"} onClick={() => onAnswer("shape")}>
          <b>65 describes A&apos;s shape</b>
          <span>The geometry of the letter somehow produces the number 65.</span>
        </ChoiceCard>
        <ChoiceCard variant="large" selected={answer === "standard"} onClick={() => onAnswer("standard")}>
          <b>The standard assigns it</b>
          <span>ASCII&apos;s published rulebook says that 65 is the identifier for uppercase A.</span>
        </ChoiceCard>
        <ChoiceCard variant="large" selected={answer === "binary"} onClick={() => onAnswer("binary")}>
          <b>Binary forces A to be 65</b>
          <span>The binary number system itself determines which number the letter must have.</span>
        </ChoiceCard>
      </div>

      {answer === "shape" && <Feedback tone="nudge">ASCII would still work if its designers had assigned A another unused value and every machine followed that same assignment. The shape itself does not calculate 65.</Feedback>}
      {answer === "binary" && <Feedback tone="nudge">Binary tells us how to represent the number 65 once we have 65. It does not decide that the letter A should receive that number.</Feedback>}
      {answer === "standard" && (
        <>
          <Feedback tone="success">
            <div><b>Exactly. A → 65 is convention.</b><span>Once we choose the number 65, binary representation is a separate mathematical step.</span></div>
          </Feedback>

          <div className="l3-three-layer" aria-label="Character to ASCII number to binary">
            <div><small>Character</small><strong>A</strong><span>human-visible symbol</span></div>
            <b>→</b>
            <div><small>ASCII agreement</small><strong>65</strong><span>assigned by the standard</span></div>
            <b>→</b>
            <div><small>7-bit binary</small><code>{toSevenBit(65)}</code><span>positional mathematics</span></div>
          </div>

          <div className="l3-byte-note">
            <span>In an 8-bit byte, the same value is commonly shown as</span><code>{toByteBinary(65)}</code><span>— one leading 0 plus ASCII&apos;s seven bits.</span>
          </div>

          <button className="primary-button l3-main-action" onClick={onContinue}>Explore how the table is organized →</button>
        </>
      )}
    </div>
  );
}
