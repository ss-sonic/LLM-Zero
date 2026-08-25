import Link from "next/link";

export function CompleteStep({ onRestart }: { onRestart: () => void }) {
  return (
    <div className="screen-layout complete-screen">
      <div className="completion-mark">✓</div>
      <p className="eyebrow">Lesson 02 complete</p>
      <h2>Representation is only half the job.</h2>
      <p className="lead completion-lead">A sender and receiver can communicate only when they use the same rule to turn symbols into numbers and numbers back into symbols.</p>

      <div className="l2-final-model" aria-label="Communication mental model">
        <div><small>Representation</small><b>symbol → number</b></div>
        <span>+</span>
        <div><small>Shared agreement</small><b>same rule at both ends</b></div>
        <span>=</span>
        <div><small>Communication</small><b>meaning survives the trip</b></div>
      </div>

      <div className="next-lesson-card">
        <div>
          <small>One final scaling problem</small>
          <h3>What if thousands of computers need the same table?</h3>
          <p>Instead of every pair negotiating privately, publish one rulebook that every machine can implement.</p>
        </div>
        <Link className="primary-button" href="/lessons/ascii">Start Lesson 03 →</Link>
      </div>

      <div className="l2-complete-actions">
        <Link href="/" className="primary-button">Back to course map</Link>
        <button className="text-link-button" onClick={onRestart}>Replay this lesson</button>
      </div>
    </div>
  );
}
