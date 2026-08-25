"use client";

import { ChoiceCard } from "../../../components/ui/ChoiceCard";
import { Feedback } from "../../../components/ui/Feedback";
import type { StorageAnswer } from "../types";

export function IdentityStorageStep({
  answer,
  onAnswer,
  onContinue,
}: {
  answer: StorageAnswer;
  onAnswer: (answer: Exclude<StorageAnswer, null>) => void;
  onContinue: () => void;
}) {
  return (
    <div className="screen-layout centered-screen wide-screen l5-screen">
      <div className="screen-copy centered-copy compact-copy">
        <p className="eyebrow">Step 6 · Identity is not storage</p>
        <h2>Does U+1F680 tell us the bytes stored for 🚀?</h2>
        <p className="lead">The code point identifies the Unicode entry. But identification and storage are different jobs.</p>
      </div>

      <div className="l5-choice-grid two-choice">
        <ChoiceCard variant="large" selected={answer === "stored"} onClick={() => onAnswer("stored")}>
          <b>Yes — that is the stored data</b>
          <span>U+1F680 already specifies the exact byte sequence in memory.</span>
        </ChoiceCard>
        <ChoiceCard variant="large" selected={answer === "identity"} onClick={() => onAnswer("identity")}>
          <b>No — it identifies the character</b>
          <span>We still need a separate rule for turning that numeric identity into storage units.</span>
        </ChoiceCard>
      </div>

      {answer === "stored" && <Feedback tone="nudge">U+1F680 names a code point. Different Unicode encoding forms can represent the same code point using different code-unit sequences, so the code point alone cannot be the final stored bytes.</Feedback>}
      {answer === "identity" && (
        <>
          <Feedback tone="success">
            <div><b>Exactly. Unicode has solved identity here, not storage.</b><span>The number 128640 is far larger than the 0–255 range of one byte, which makes the next problem impossible to ignore.</span></div>
          </Feedback>

          <div className="l5-unresolved-pipeline" aria-label="Character identity with unresolved storage">
            <div><small>Visible character</small><strong>🚀</strong></div>
            <span>→</span>
            <div><small>Unicode identity</small><code>U+1F680</code><b>128640</b></div>
            <span>→</span>
            <div className="unresolved"><small>Bytes in memory</small><strong>?</strong><span>not decided by the code point itself</span></div>
          </div>

          <div className="l5-byte-limit card">
            <span>One byte can represent values</span><strong>0 → 255</strong><b>128640 does not fit.</b>
          </div>

          <button className="primary-button l5-main-action" onClick={onContinue}>Prove you understand the identity layer →</button>
        </>
      )}
    </div>
  );
}
