import { RECEIVER_PRIVATE_TABLE, SENDER_PRIVATE_TABLE } from "../config";

export function MismatchStep({
  sent,
  onSend,
  onContinue,
}: {
  sent: boolean;
  onSend: () => void;
  onContinue: () => void;
}) {
  return (
    <div className="screen-layout centered-screen wide-screen l2-screen">
      <div className="screen-copy centered-copy compact-copy">
        <p className="eyebrow">Lesson 02 · The mismatch</p>
        <h1>Computer 1 wants to send the letter A.</h1>
        <p className="lead">It cannot send the shape itself, so it uses its private rule: <strong>A → {SENDER_PRIVATE_TABLE.A}</strong>. What will Computer 2 see?</p>
      </div>

      <div className="l2-wire-experiment" aria-label="Two computers using different character tables">
        <div className="l2-machine card">
          <small>Computer 1 · sender</small>
          <div className="l2-display">A</div>
          <code>A → {SENDER_PRIVATE_TABLE.A}</code>
        </div>

        <div className="l2-wire">
          <div className={sent ? "l2-packet is-sent" : "l2-packet"}>{SENDER_PRIVATE_TABLE.A}</div>
          <span className="l2-wire-line" />
          <small>only the number travels</small>
        </div>

        <div className="l2-machine card">
          <small>Computer 2 · receiver</small>
          <div className={sent ? "l2-display wrong" : "l2-display"}>{sent ? "B" : "?"}</div>
          <code>B → {RECEIVER_PRIVATE_TABLE.B}</code>
        </div>
      </div>

      {!sent ? (
        <button className="primary-button l2-main-action" onClick={onSend}>Send {SENDER_PRIVATE_TABLE.A} →</button>
      ) : (
        <div className="feedback l2-mismatch-feedback">
          <div><b>It arrived as B.</b><span>The number stayed {SENDER_PRIVATE_TABLE.A}. Something else disagreed.</span></div>
          <button className="primary-button" onClick={onContinue}>Find the disagreement →</button>
        </div>
      )}
    </div>
  );
}
