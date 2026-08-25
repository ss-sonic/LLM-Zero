import { asciiValue } from "../ascii";

const word = "HELLO";
const values = Array.from(word).map((character) => asciiValue(character));

export function ProveAsciiStep({
  sent,
  onSend,
  onContinue,
}: {
  sent: boolean;
  onSend: () => void;
  onContinue: () => void;
}) {
  return (
    <div className="screen-layout centered-screen wide-screen l4-screen">
      <div className="screen-copy centered-copy compact-copy">
        <p className="eyebrow">Lesson 04 · Start from success</p>
        <h1>Can ASCII still do its job?</h1>
        <p className="lead">Before we break anything, prove that the shared table still works perfectly for text it actually contains.</p>
      </div>

      <div className="l4-proof-card card">
        <div className="l4-word-row" aria-label="HELLO encoded with ASCII">
          {Array.from(word).map((character, index) => (
            <div className="l4-letter-map" key={`${character}-${index}`}>
              <strong>{character}</strong><span>→</span><code>{values[index]}</code>
            </div>
          ))}
        </div>

        {!sent ? (
          <button className="primary-button" onClick={onSend}>Encode and send HELLO →</button>
        ) : (
          <div className="l4-transmission-result">
            <code>{values.join("  ")}</code><span>travels</span><strong>HELLO ✓</strong>
          </div>
        )}
      </div>

      {sent && (
        <div className="feedback success-feedback">
          <div><b>ASCII is working exactly as designed.</b><span>Both computers share the same entries, so the message survives the trip. Now let&apos;s find the edge of the table.</span></div>
          <button className="primary-button" onClick={onContinue}>Change one character →</button>
        </div>
      )}
    </div>
  );
}
