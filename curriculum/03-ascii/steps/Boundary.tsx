"use client";

import { encodeAscii } from "../ascii";
import { ASCII_BOUNDARY_SAMPLES } from "../config";

export function BoundaryStep({
  sampleId,
  onTry,
  onContinue,
}: {
  sampleId: string | null;
  onTry: (sampleId: string, failed: boolean) => void;
  onContinue: () => void;
}) {
  const selected = ASCII_BOUNDARY_SAMPLES.find((sample) => sample.id === sampleId) ?? null;
  const result = selected ? encodeAscii(selected.text) : null;
  const failed = Boolean(result && result.unsupported.length > 0);

  return (
    <div className="screen-layout centered-screen wide-screen l3-screen">
      <div className="screen-copy centered-copy compact-copy">
        <p className="eyebrow">Step 7 · Find the boundary</p>
        <h2>Can ASCII encode every message people might want to type?</h2>
        <p className="lead">Choose a message and ask ASCII to encode it. Remember: the original ASCII rulebook only has values 0 through 127.</p>
      </div>

      <div className="l3-boundary-card card">
        <div className="l3-sample-row">
          {ASCII_BOUNDARY_SAMPLES.map((sample) => {
            const sampleResult = encodeAscii(sample.text);
            const sampleFails = sampleResult.unsupported.length > 0;
            return (
              <button
                className={sampleId === sample.id ? "selected" : ""}
                key={sample.id}
                onClick={() => onTry(sample.id, sampleFails)}
              >{sample.label}</button>
            );
          })}
        </div>

        {!selected && <p className="l3-boundary-prompt">Try a message. ASCII will either return numbers or show where its table runs out.</p>}

        {selected && result && !failed && (
          <div className="l3-boundary-success">
            <small>ASCII can encode {selected.label}</small>
            <code>{result.values.join("  ")}</code>
            <p>Every character in this message has an entry in the ASCII table. Try one of the other examples.</p>
          </div>
        )}

        {selected && result && failed && (
          <div className="l3-boundary-failure">
            <small>ASCII gets stuck</small>
            <strong>{selected.label}</strong>
            <div className="l3-unsupported-row">
              {result.unsupported.map((character, index) => <span key={`${character}-${index}`}>{character} → no ASCII entry</span>)}
            </div>
            <p>The message is perfectly valid human text. The problem is simply that ASCII&apos;s published table does not contain these characters.</p>
          </div>
        )}
      </div>

      {failed && (
        <div className="feedback l3-boundary-feedback">
          <div><b>You found ASCII&apos;s boundary.</b><span>A standard can make everyone agree and still be too small for the world people need to represent.</span></div>
          <button className="primary-button" onClick={onContinue}>Finish Lesson 03 →</button>
        </div>
      )}
    </div>
  );
}
