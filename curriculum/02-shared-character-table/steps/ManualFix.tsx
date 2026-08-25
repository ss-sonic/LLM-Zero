import type { ScaleChoice } from "../types";

export function ManualFixStep({
  attached,
  choice,
  onAttach,
  onChoice,
  onContinue,
}: {
  attached: boolean;
  choice: ScaleChoice;
  onAttach: () => void;
  onChoice: (choice: Exclude<ScaleChoice, null>) => void;
  onContinue: () => void;
}) {
  return (
    <div className="screen-layout centered-screen wide-screen l2-screen">
      <div className="screen-copy centered-copy compact-copy">
        <p className="eyebrow">Step 3 · A possible fix</p>
        <h2>What if we explain our private table with every message?</h2>
        <p className="lead">That would work. But watch what happens to a tiny message like <strong>CAB</strong>.</p>
      </div>

      <div className="l2-envelope card">
        <div>
          <small>Message data</small>
          <div className="l2-value-strip"><code>81</code><code>12</code><code>37</code></div>
        </div>
        {attached && (
          <div className="l2-instructions">
            <small>Repeated interpretation instructions</small>
            <div className="l2-rule-strip"><code>A</code><code>12</code><code>B</code><code>37</code><code>C</code><code>81</code></div>
          </div>
        )}
      </div>

      {!attached ? (
        <button className="primary-button l2-main-action" onClick={onAttach}>Attach the private table too →</button>
      ) : (
        <>
          <div className="l2-cost-meter">
            <div><strong>3</strong><span>message values</span></div>
            <span>+</span>
            <div><strong>6</strong><span>rule values repeated</span></div>
            <span>=</span>
            <div><strong>9</strong><span>pieces sent</span></div>
          </div>

          <div className="l2-question-block">
            <div className="screen-copy centered-copy compact-copy">
              <h2>If these computers talk all day, what is the cleaner design?</h2>
            </div>
            <div className="binary-choice-row">
              <button className={choice === "instructions" ? "big-choice selected" : "big-choice"} onClick={() => onChoice("instructions")}>
                <b>Repeat the table</b><span>Keep explaining the same mapping inside every message.</span>
              </button>
              <button className={choice === "agree" ? "big-choice selected" : "big-choice"} onClick={() => onChoice("agree")}>
                <b>Agree once</b><span>Use the same table on both computers before messages are sent.</span>
              </button>
            </div>
            {choice === "instructions" && <div className="feedback nudge">That can work, but we keep shipping the same interpretation rules again and again. Can the rule live at both ends instead?</div>}
            {choice === "agree" && (
              <div className="feedback success-feedback">
                <div><b>That is the key move.</b><span>Put the same rulebook on both sides, then send only the data.</span></div>
                <button className="primary-button" onClick={onContinue}>Build one shared table →</button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
