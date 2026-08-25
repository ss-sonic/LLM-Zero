"use client";

import { BYTE_PLACE_VALUES, bitsToNumber, toBits } from "../../../lib/lesson/binary";
import type { BitPhase } from "../types";

export function BinaryStep({
  agreedNumber,
  labBits,
  bitPhase,
  hasFlippedBit,
  onToggleBuildBit,
  onStartExplanation,
  onStartFreePlay,
  onFlipBit,
  onContinue,
}: {
  agreedNumber: number;
  labBits: string[];
  bitPhase: BitPhase;
  hasFlippedBit: boolean;
  onToggleBuildBit: (index: number) => void;
  onStartExplanation: () => void;
  onStartFreePlay: () => void;
  onFlipBit: (index: number) => void;
  onContinue: () => void;
}) {
  const labNumber = bitsToNumber(labBits);
  const targetBits = toBits(agreedNumber);
  const activePlaceValues = BYTE_PLACE_VALUES.filter((_, index) => targetBits[index] === "1");
  const buildDifference = agreedNumber - labNumber;
  const buildSolved = labNumber === agreedNumber;

  return (
    <div className="screen-layout centered-screen wide-screen bit-screen">
      <div className="screen-copy centered-copy compact-copy">
        <p className="eyebrow">Step 5 · Look underneath the number</p>
        {bitPhase === "build" && (
          <>
            <h2>Can you build {agreedNumber} using these eight switches?</h2>
            <p className="lead">Each switch has a fixed value. ON means “include this value.” OFF means “do not include it.” Make the total equal {agreedNumber}.</p>
          </>
        )}
        {bitPhase === "explain" && (
          <>
            <h2>Why is {agreedNumber} exactly <span className="binary-heading">{targetBits.join("")}</span>?</h2>
            <p className="lead">Because binary is positional math. The pattern tells us exactly which fixed place values to add.</p>
          </>
        )}
        {bitPhase === "play" && (
          <>
            <h2>Now break it on purpose.</h2>
            <p className="lead">Change any one bit. Because each position has a fixed value, the stored number must change too.</p>
          </>
        )}
      </div>

      <div className="bit-lab card dark-card">
        {bitPhase === "build" && (
          <>
            <div className="target-meter">
              <div><small>Target</small><strong>{agreedNumber}</strong></div>
              <span>→</span>
              <div><small>Your total</small><strong className={buildSolved ? "solved-total" : ""}>{labNumber}</strong></div>
            </div>

            <div className="bit-values place-value-labels" aria-hidden="true">
              {BYTE_PLACE_VALUES.map((value) => <span key={value}>+{value}</span>)}
            </div>
            <div className="bits" aria-label={`Your binary value ${labBits.join("")}, total ${labNumber}`}>
              {labBits.map((bit, index) => (
                <button
                  key={index}
                  onClick={() => onToggleBuildBit(index)}
                  className={bit === "1" ? "bit on" : "bit"}
                  aria-label={`${bit === "1" ? "Remove" : "Add"} ${BYTE_PLACE_VALUES[index]}, currently ${bit}`}
                >
                  {bit}
                </button>
              ))}
            </div>

            <div className="build-equation" aria-live="polite">
              <span>{labBits.join("")}</span>
              <b>=</b>
              <strong>{labNumber}</strong>
            </div>

            {!buildSolved && (
              <p className={buildDifference > 0 ? "build-hint" : "build-hint over"}>
                {buildDifference > 0
                  ? `You still need ${buildDifference} more.`
                  : `You went ${Math.abs(buildDifference)} too high. Turn something off.`}
              </p>
            )}

            {buildSolved && (
              <div className="bit-discovery build-success">
                <p><b>You built {agreedNumber}.</b> Now let&apos;s unpack why this exact pattern works.</p>
                <button className="primary-button light-button" onClick={onStartExplanation}>Show the calculation →</button>
              </div>
            )}
          </>
        )}

        {bitPhase === "explain" && (
          <div className="binary-explanation">
            <div className="calculation-grid" aria-label={`Binary calculation for ${agreedNumber}`}>
              {BYTE_PLACE_VALUES.map((value, index) => (
                <div className={targetBits[index] === "1" ? "calc-column active" : "calc-column"} key={value}>
                  <small>place</small>
                  <b>{value}</b>
                  <span>×</span>
                  <strong>{targetBits[index]}</strong>
                  <em>= {targetBits[index] === "1" ? value : 0}</em>
                </div>
              ))}
            </div>

            <div className="sum-panel">
              <small>Add only the places whose bit is 1</small>
              <div className="sum-line">
                <span>{activePlaceValues.length ? activePlaceValues.join(" + ") : "0"}</span>
                <b>=</b>
                <strong>{agreedNumber}</strong>
              </div>
              <code>{targetBits.join("")}</code>
            </div>

            <details className="place-values-explainer">
              <summary>Why are the places 128, 64, 32, 16, 8, 4, 2, 1?</summary>
              <div className="place-values-body">
                <p>It is the same positional idea you already use in decimal.</p>
                <div className="base-comparison">
                  <div>
                    <small>Decimal · powers of 10</small>
                    <code>1000 · 100 · 10 · 1</code>
                  </div>
                  <div>
                    <small>Binary · powers of 2</small>
                    <code>128 · 64 · 32 · 16 · 8 · 4 · 2 · 1</code>
                  </div>
                </div>
                <p>Binary has only two digits: 0 means “leave this place out” and 1 means “include this place.” With fixed powers-of-two places, each whole number from 0 to 255 has one 8-bit pattern.</p>
              </div>
            </details>

            <div className="rule-contrast">
              <div>
                <small>Human convention</small>
                <b>A → {agreedNumber}</b>
                <span>We were free to choose this.</span>
              </div>
              <div>
                <small>Positional math</small>
                <b>{agreedNumber} → {targetBits.join("")}</b>
                <span>Once binary&apos;s place values are fixed, this is determined.</span>
              </div>
            </div>

            <button className="primary-button light-button explanation-next" onClick={onStartFreePlay}>I get it — let me change a bit →</button>
          </div>
        )}

        {bitPhase === "play" && (
          <>
            <div className="bit-values" aria-hidden="true">
              {BYTE_PLACE_VALUES.map((value) => <span key={value}>{value}</span>)}
            </div>
            <div className="bits" aria-label={`Binary value ${labBits.join("")}`}>
              {labBits.map((bit, index) => (
                <button
                  key={index}
                  onClick={() => onFlipBit(index)}
                  className={bit === "1" ? "bit on" : "bit"}
                  aria-label={`Bit worth ${BYTE_PLACE_VALUES[index]}, currently ${bit}`}
                >
                  {bit}
                </button>
              ))}
            </div>
            <div className="equation">
              <span>{labBits.join("")}</span>
              <b>=</b>
              <strong>{labNumber}</strong>
            </div>
            {!hasFlippedBit && <p className="lab-hint">Flip any one bit and watch the total.</p>}
            {hasFlippedBit && (
              <div className="bit-discovery">
                <p>Changing one position changed the value from <b>{agreedNumber}</b> to <b>{labNumber}</b>. The positions carry the math.</p>
                <button className="primary-button light-button" onClick={onContinue}>Continue →</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
