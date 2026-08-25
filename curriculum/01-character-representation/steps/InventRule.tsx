"use client";

export function InventRuleStep({
  numberDraft,
  onNumberDraftChange,
  onCommit,
}: {
  numberDraft: string;
  onNumberDraftChange: (value: string) => void;
  onCommit: () => void;
}) {
  const valid = numberDraft !== "" && Number.isFinite(Number(numberDraft));

  return (
    <div className="screen-layout split-screen">
      <div className="screen-copy">
        <p className="eyebrow">Step 2 · Invent a rule</p>
        <h2>Suppose a computer is only willing to store numbers.</h2>
        <p className="lead">We want to store <strong>A</strong>. Pick any whole number from 0 to 255 to stand for it.</p>
        <p className="quiet-copy">There is no trick here. You are allowed to invent the rule.</p>
      </div>
      <div className="mapping-lab card">
        <span className="mapping-caption">Your private rule</span>
        <div className="mapping-equation">
          <span className="mapping-symbol">A</span>
          <span className="mapping-arrow">→</span>
          <input
            className="number-input"
            type="number"
            min="0"
            max="255"
            value={numberDraft}
            onChange={(event) => onNumberDraftChange(event.target.value)}
            aria-label="Choose a number for A"
          />
        </div>
        <p>Try 7. Try 42. Try 201. Your choice is allowed.</p>
        <button className="primary-button full-button" disabled={!valid} onClick={onCommit}>
          Use this rule →
        </button>
      </div>
    </div>
  );
}
