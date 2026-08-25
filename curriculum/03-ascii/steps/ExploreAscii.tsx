"use client";

import { printableAscii, toByteBinary, toSevenBit } from "../ascii";

const jumpValues = [65, 66, 67, 48, 49, 50, 97, 98, 99];

function groupFor(value: number) {
  if (value >= 48 && value <= 57) return "digit";
  if (value >= 65 && value <= 90) return "uppercase letter";
  if (value >= 97 && value <= 122) return "lowercase letter";
  return "punctuation / symbol";
}

export function ExploreAsciiStep({
  value,
  exploredValues,
  onSelect,
  onContinue,
}: {
  value: number;
  exploredValues: number[];
  onSelect: (value: number) => void;
  onContinue: () => void;
}) {
  const uniqueExplored = new Set(exploredValues).size;
  const ready = uniqueExplored >= 4;

  return (
    <div className="screen-layout centered-screen wide-screen l3-screen">
      <div className="screen-copy centered-copy compact-copy">
        <p className="eyebrow">Step 5 · Explore the table</p>
        <h2>Are ASCII&apos;s assignments just a pile of random numbers?</h2>
        <p className="lead">Inspect at least four printable values. Watch what happens when you move through letters and digits.</p>
      </div>

      <div className="l3-explorer card">
        <div className="l3-explorer-display">
          <div><small>Character</small><strong>{value === 32 ? "␠" : printableAscii(value)}</strong></div>
          <div><small>ASCII value</small><strong>{value}</strong></div>
          <div><small>7-bit binary</small><code>{toSevenBit(value)}</code></div>
        </div>

        <label className="l3-range-label">
          <span>Printable ASCII: 32 → 126</span>
          <input
            type="range"
            min={32}
            max={126}
            value={value}
            onChange={(event) => onSelect(Number(event.target.value))}
          />
        </label>

        <div className="l3-jump-row" aria-label="ASCII values to inspect quickly">
          {jumpValues.map((jump) => (
            <button className={value === jump ? "selected" : ""} key={jump} onClick={() => onSelect(jump)}>
              {printableAscii(jump)} <small>{jump}</small>
            </button>
          ))}
        </div>

        <p className="l3-explorer-caption">You are looking at a <strong>{groupFor(value)}</strong>. In an 8-bit byte, {value} would appear as <code>{toByteBinary(value)}</code>.</p>
        <div className="l3-inspection-meter"><span>Values inspected</span><strong>{Math.min(uniqueExplored, 4)} / 4</strong></div>
      </div>

      {ready && (
        <div className="l3-pattern-reveal">
          <h3>There is deliberate structure.</h3>
          <div className="l3-pattern-rows">
            <code>A 65 · B 66 · C 67 · … · Z 90</code>
            <code>0 48 · 1 49 · 2 50 · … · 9 57</code>
            <code>a 97 · b 98 · c 99 · … · z 122</code>
          </div>
          <p>The exact assignments are conventional, but related characters were deliberately placed in consecutive ranges. Convention does not mean “without design.”</p>
          <button className="primary-button" onClick={onContinue}>Use the standard to send a word →</button>
        </div>
      )}
    </div>
  );
}
