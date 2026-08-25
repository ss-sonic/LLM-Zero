"use client";

import { Feedback } from "../../../components/ui/Feedback";
import { canAsciiRepresent } from "../ascii";
import { WORLD_SAMPLES } from "../config";

export function WorldTextStep({
  seenIds,
  onInspect,
  onContinue,
}: {
  seenIds: string[];
  onInspect: (id: string) => void;
  onContinue: () => void;
}) {
  const ready = new Set(seenIds).size >= 3;

  return (
    <div className="screen-layout centered-screen wide-screen l4-screen">
      <div className="screen-copy centered-copy compact-copy">
        <p className="eyebrow">Step 4 · Try the world</p>
        <h2>Is é the only character ASCII is missing?</h2>
        <p className="lead">Inspect at least three real text samples. We are asking only one question: can ASCII represent the whole sample using its existing table?</p>
      </div>

      <div className="l4-world-grid">
        {WORLD_SAMPLES.map((sample) => {
          const seen = seenIds.includes(sample.id);
          const representable = canAsciiRepresent(sample.text);
          return (
            <button className={seen ? "l4-world-card inspected" : "l4-world-card"} key={sample.id} onClick={() => onInspect(sample.id)}>
              <small>{sample.label}</small>
              <strong dir="auto">{sample.text}</strong>
              <span>{seen ? (representable ? "ASCII ✓" : "Not representable by ASCII ✕") : "Inspect with ASCII →"}</span>
            </button>
          );
        })}
      </div>

      <div className="l4-inspection-meter"><span>Samples inspected</span><strong>{Math.min(new Set(seenIds).size, 3)} / 3</strong></div>

      {ready && (
        <Feedback tone="mismatch">
          <div><b>The problem is much larger than one accented letter.</b><span>ASCII&apos;s 128-value repertoire does not contain the characters needed by entire writing systems, and it does not contain emoji either.</span></div>
          <button className="primary-button" onClick={onContinue}>Why not make the table bigger? →</button>
        </Feedback>
      )}
    </div>
  );
}
