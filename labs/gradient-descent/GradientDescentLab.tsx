"use client";

import { useMemo, useState } from "react";
import { LessonPlayer } from "../../components/lesson/LessonPlayer";
import { Feedback } from "../../components/ui/Feedback";
import { QuestionPrompt } from "../../components/ui/QuestionPrompt";
import styles from "./GradientDescentLab.module.css";

const STEP_LABELS = ["Scrub the weight", "Probe direction", "Derive and update", "Complete"];
const X_VALUE = 2;
const TARGET = 10;
const LEARNING_RATE = 0.1;
const PROBE_ORIGIN = 3;
const W_MIN = -1;
const W_MAX = 8;

function prediction(weight: number) {
  return X_VALUE * weight;
}

function error(weight: number) {
  return prediction(weight) - TARGET;
}

function loss(weight: number) {
  return error(weight) ** 2;
}

/** d(loss)/dw for loss = (x·w − target)², i.e. 2 · error · x. */
function gradient(weight: number) {
  return 2 * error(weight) * X_VALUE;
}

function format(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

function matches(input: string, expected: number) {
  const numeric = Number(input);
  return input.trim() !== "" && Number.isFinite(numeric) && Math.abs(numeric - expected) < 0.001;
}

type Probe = { weight: number; loss: number };

function LossChart({ weight }: { weight: number }) {
  const points = useMemo(() => Array.from({ length: 91 }, (_, index) => {
    const w = W_MIN + index * .1;
    const x = 32 + ((w - W_MIN) / (W_MAX - W_MIN)) * 556;
    const y = 210 - (loss(w) / 144) * 176;
    return `${x},${y}`;
  }).join(" "), []);
  const x = 32 + ((weight - W_MIN) / (W_MAX - W_MIN)) * 556;
  const y = 210 - (loss(weight) / 144) * 176;

  return (
    <div className={styles.chartWrap} aria-label="Loss curve as the weight changes">
      <svg viewBox="0 0 620 240" role="img">
        <line x1="32" y1="210" x2="592" y2="210" stroke="currentColor" opacity=".2" />
        <line x1="32" y1="28" x2="32" y2="210" stroke="currentColor" opacity=".2" />
        <polyline points={points} fill="none" stroke="currentColor" strokeWidth="3" opacity=".72" />
        <circle cx={x} cy={y} r="7" fill="var(--accent)" stroke="var(--ink)" strokeWidth="2" />
      </svg>
      <div className={styles.chartLabel}><span>w = {W_MIN}</span><b>loss curve</b><span>w = {W_MAX}</span></div>
    </div>
  );
}

export function GradientDescentLab() {
  const [currentStep, setCurrentStep] = useState(0);
  const [highestUnlocked, setHighestUnlocked] = useState(0);
  const [weight, setWeight] = useState(1);
  const [probeDraft, setProbeDraft] = useState("");
  const [probes, setProbes] = useState<Probe[]>([]);
  const [probeError, setProbeError] = useState("");
  const [direction, setDirection] = useState<"increase" | "decrease" | null>(null);
  const [errorInput, setErrorInput] = useState("");
  const [gradientInput, setGradientInput] = useState("");
  const [updateInput, setUpdateInput] = useState("");

  function unlock(step: number) {
    setHighestUnlocked((current) => Math.max(current, step));
  }

  function goTo(step: number) {
    if (step < 0 || step > highestUnlocked) return;
    setCurrentStep(step);
  }

  function restart() {
    setCurrentStep(0);
    setHighestUnlocked(0);
    setWeight(1);
    setProbeDraft("");
    setProbes([]);
    setProbeError("");
    setDirection(null);
    setErrorInput("");
    setGradientInput("");
    setUpdateInput("");
  }

  function addProbe() {
    const value = Number(probeDraft);
    if (probeDraft.trim() === "" || !Number.isFinite(value)) {
      setProbeError("Type a number to probe.");
      return;
    }
    if (value < W_MIN || value > W_MAX) {
      setProbeError(`Stay between ${W_MIN} and ${W_MAX}.`);
      return;
    }
    if (Math.abs(value - PROBE_ORIGIN) < 0.001) {
      setProbeError(`w = ${PROBE_ORIGIN} is where we already are. Probe a different value.`);
      return;
    }
    if (probes.some((probe) => Math.abs(probe.weight - value) < 0.001)) {
      setProbeError("You already probed that value.");
      return;
    }
    setProbes((current) => [...current, { weight: value, loss: loss(value) }]);
    setProbeDraft("");
    setProbeError("");
  }

  const currentLoss = loss(weight);
  const lowestLoss = (candidates: Probe[]) => candidates.reduce<Probe | null>(
    (best, probe) => (best === null || probe.loss < best.loss ? probe : best),
    null,
  );
  const bestBelow = lowestLoss(probes.filter((probe) => probe.weight < PROBE_ORIGIN));
  const bestAbove = lowestLoss(probes.filter((probe) => probe.weight > PROBE_ORIGIN));
  const bothSidesProbed = bestBelow !== null && bestAbove !== null;
  // Below w = 3 the loss is always worse, but a probe far above (w >= 7) overshoots the
  // minimum and is worse too — so "increase" is only *evidenced* by a nearby probe.
  const evidenceSupportsIncrease = bestAbove !== null && bestAbove.loss < loss(PROBE_ORIGIN);

  const expectedError = error(PROBE_ORIGIN);
  const expectedGradient = gradient(PROBE_ORIGIN);
  const expectedUpdate = PROBE_ORIGIN - LEARNING_RATE * expectedGradient;
  const errorDone = matches(errorInput, expectedError);
  const gradientDone = errorDone && matches(gradientInput, expectedGradient);
  const updateDone = gradientDone && matches(updateInput, expectedUpdate);

  let screen;

  if (currentStep === 0) {
    const solved = currentLoss < .01;
    screen = (
      <div className={`screen-layout ${styles.labScreen}`}>
        <QuestionPrompt
          eyebrow="Experimental lab · Continuous math"
          title="Can you make the error disappear by changing one number?"
          lead="This is not a curriculum lesson yet. It stress-tests whether the same learning shell can teach a continuous optimization idea instead of a discrete lookup."
        />
        <div className={styles.labGrid}>
          <div className={styles.panel}>
            <label className={styles.rangeLabel}>
              <span>Drag the weight: w = {format(weight)}</span>
              <input
                type="range"
                min={W_MIN}
                max={W_MAX}
                step="0.1"
                value={weight}
                onChange={(event) => {
                  const next = Number(event.target.value);
                  setWeight(next);
                  if (loss(next) < .01) unlock(1);
                }}
              />
            </label>
            <div className={styles.metricGrid}>
              <div className={styles.metric}><small>prediction</small><strong>{format(prediction(weight))}</strong></div>
              <div className={styles.metric}><small>target</small><strong>{TARGET}</strong></div>
              <div className={styles.metric}><small>loss</small><strong>{format(currentLoss)}</strong></div>
            </div>
            <div className={styles.formula}>prediction = 2 × w<br />loss = (prediction − 10)²</div>
          </div>
          <div className={styles.panel}><LossChart weight={weight} /></div>
        </div>
        {solved ? (
          <Feedback tone="success"><div><b>You found the bottom of the curve.</b><span>w = 5 makes the prediction 10 and the loss 0. No multiple-choice answer was needed.</span></div><button className="primary-button" onClick={() => { unlock(1); setCurrentStep(1); }}>Now find the direction without solving it →</button></Feedback>
        ) : <p className={styles.labNote}>Goal: use the live numbers and curve to make the loss reach 0.</p>}
      </div>
    );
  } else if (currentStep === 1) {
    screen = (
      <div className={`screen-layout centered-screen ${styles.labScreen}`}>
        <QuestionPrompt
          eyebrow="Prototype · Direction from evidence"
          title={`At w = ${PROBE_ORIGIN}, which direction makes the loss smaller?`}
          lead="Choose your own test values on both sides of the current weight, then read your own evidence. Nothing here is pre-computed for you."
        />
        <div className={styles.panel}>
          <div className={styles.metricGrid}>
            <div className={styles.metric}><small>current w</small><strong>{PROBE_ORIGIN}</strong></div>
            <div className={styles.metric}><small>prediction</small><strong>{format(prediction(PROBE_ORIGIN))}</strong></div>
            <div className={styles.metric}><small>loss</small><strong>{format(loss(PROBE_ORIGIN))}</strong></div>
          </div>

          <div className={styles.probeForm}>
            <label>
              <span>Probe a weight of your choosing</span>
              <input
                className={styles.numberInput}
                type="number"
                step="0.1"
                min={W_MIN}
                max={W_MAX}
                value={probeDraft}
                placeholder="e.g. 3.5"
                onChange={(event) => { setProbeDraft(event.target.value); setProbeError(""); }}
                onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addProbe(); } }}
                aria-label="Weight to probe"
              />
            </label>
            <button className="secondary-button" onClick={addProbe}>Probe this value →</button>
          </div>
          {probeError ? <p className={styles.probeError} role="alert">{probeError}</p> : null}

          {probes.length > 0 ? (
            <table className={styles.probeTable}>
              <caption>Your measurements</caption>
              <thead>
                <tr><th scope="col">w</th><th scope="col">prediction</th><th scope="col">loss</th><th scope="col">vs. 16</th></tr>
              </thead>
              <tbody>
                {probes.map((probe) => (
                  <tr key={probe.weight}>
                    <td>{format(probe.weight)}</td>
                    <td>{format(prediction(probe.weight))}</td>
                    <td>{format(probe.loss)}</td>
                    <td className={probe.loss < loss(PROBE_ORIGIN) ? styles.better : styles.worse}>
                      {probe.loss < loss(PROBE_ORIGIN) ? "lower" : "higher"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}

          <p className={styles.labNote}>
            {bothSidesProbed
              ? "You have evidence on both sides. Commit to a direction."
              : `Probe at least one value below ${PROBE_ORIGIN} and one above it.`}
          </p>
        </div>

        {bothSidesProbed ? (
          <div className={styles.directionBlock}>
            <h3 className={styles.directionQuestion}>Based on your own measurements, which way should w move?</h3>
            <div className={styles.directionActions}>
              <button className={direction === "decrease" ? "primary-button" : "secondary-button"} onClick={() => setDirection("decrease")}>Decrease w</button>
              <button className={direction === "increase" ? "primary-button" : "secondary-button"} onClick={() => setDirection("increase")}>Increase w</button>
            </div>
            {direction === "decrease" && bestBelow !== null ? (
              <Feedback tone="nudge">
                Read your own row again: w = {format(bestBelow.weight)} gave a loss of {format(bestBelow.loss)}, which is worse than the {format(loss(PROBE_ORIGIN))} you started with.
              </Feedback>
            ) : null}
            {direction === "increase" && bestAbove !== null && bestBelow !== null && !evidenceSupportsIncrease ? (
              <Feedback tone="nudge">
                Every value you tried is worse than 16, on both sides — including w = {format(bestAbove.weight)} at a loss of {format(bestAbove.loss)}.
                You have stepped clean over the bottom of the curve. Probe something closer to {PROBE_ORIGIN} and look again.
              </Feedback>
            ) : null}
            {direction === "increase" && evidenceSupportsIncrease && bestAbove !== null && bestBelow !== null ? (
              <Feedback tone="success">
                <div>
                  <b>Your measurements point right.</b>
                  <span>
                    You measured a lower loss above {PROBE_ORIGIN} ({format(bestAbove.weight)} → {format(bestAbove.loss)}) and a higher one below it
                    ({format(bestBelow.weight)} → {format(bestBelow.loss)}). A gradient encodes exactly this local direction as a single number.
                  </span>
                </div>
                <button className="primary-button" onClick={() => { unlock(2); setCurrentStep(2); }}>Derive that number →</button>
              </Feedback>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  } else if (currentStep === 2) {
    screen = (
      <div className={`screen-layout centered-screen ${styles.labScreen}`}>
        <QuestionPrompt
          eyebrow="Prototype · Multi-step derivation"
          title="Can the learner derive the gradient rather than be handed it?"
          lead={`Work down the chain at w = ${PROBE_ORIGIN}. Each line unlocks only when the one above it is right — nothing is pre-filled.`}
        />
        <div className={styles.equationCard}>
          <div className={styles.formula}>
            prediction = x × w&nbsp;&nbsp;(x = {X_VALUE}, target = {TARGET})<br />
            loss = (prediction − target)²<br />
            d(loss)/dw = 2 × error × x
          </div>

          <div className={styles.derivationRow}>
            <span className={styles.derivationStep}>1</span>
            <div className={styles.equation}>
              <span>error = ({X_VALUE} × {PROBE_ORIGIN}) − {TARGET} =</span>
              <input
                className={styles.numberInput}
                type="number"
                step="0.1"
                value={errorInput}
                onChange={(event) => setErrorInput(event.target.value)}
                aria-label="Error at w = 3"
              />
              {errorDone ? <b className={styles.tick}>✓</b> : null}
            </div>
          </div>

          {errorDone ? (
            <div className={styles.derivationRow}>
              <span className={styles.derivationStep}>2</span>
              <div className={styles.equation}>
                <span>gradient = 2 × ({format(expectedError)}) × {X_VALUE} =</span>
                <input
                  className={styles.numberInput}
                  type="number"
                  step="0.1"
                  value={gradientInput}
                  onChange={(event) => setGradientInput(event.target.value)}
                  aria-label="Gradient at w = 3"
                />
                {gradientDone ? <b className={styles.tick}>✓</b> : null}
              </div>
            </div>
          ) : null}

          {gradientDone ? (
            <div className={styles.derivationRow}>
              <span className={styles.derivationStep}>3</span>
              <div className={styles.equation}>
                <span>wₙₑw = {PROBE_ORIGIN} − {LEARNING_RATE} × ({format(expectedGradient)}) =</span>
                <input
                  className={styles.numberInput}
                  type="number"
                  step="0.1"
                  value={updateInput}
                  onChange={(event) => setUpdateInput(event.target.value)}
                  aria-label="Updated weight"
                />
                {updateDone ? <b className={styles.tick}>✓</b> : null}
              </div>
            </div>
          ) : null}

          {errorInput.trim() !== "" && !errorDone ? (
            <Feedback tone="nudge">The prediction at w = {PROBE_ORIGIN} is {format(prediction(PROBE_ORIGIN))}, and the target is {TARGET}. An undershoot gives a negative error.</Feedback>
          ) : null}
          {errorDone && gradientInput.trim() !== "" && !gradientDone ? (
            <Feedback tone="nudge">Multiply all three factors, signs included: 2 × {format(expectedError)} × {X_VALUE}.</Feedback>
          ) : null}
          {gradientDone && updateInput.trim() !== "" && !updateDone ? (
            <Feedback tone="nudge">Apply the signs carefully: subtracting a negative value moves w upward.</Feedback>
          ) : null}

          {updateDone ? (
            <>
              <Feedback tone="success">
                <div>
                  <b>You derived the gradient and used it.</b>
                  <span>
                    The sign of {format(expectedGradient)} agrees with the probing you did by hand, and its size sets how far one step travels.
                  </span>
                </div>
              </Feedback>
              <div className={styles.resultStrip}>
                <div><small>before</small><b>w = {PROBE_ORIGIN} · loss = {format(loss(PROBE_ORIGIN))}</b></div>
                <span>→</span>
                <div><small>after</small><b>w = {format(expectedUpdate)} · loss = {format(loss(expectedUpdate))}</b></div>
              </div>
              <button className="primary-button" onClick={() => { unlock(3); setCurrentStep(3); }}>Finish prototype →</button>
            </>
          ) : null}
        </div>
      </div>
    );
  } else {
    screen = (
      <div className="screen-layout complete-screen">
        <div className="completion-mark">✓</div>
        <p className="eyebrow">Interaction prototype complete</p>
        <h2>The lesson shell can carry continuous and multi-step numeric work.</h2>
        <p className="lead completion-lead">The prototype used a live numeric scrubber, a loss curve, learner-chosen measurements, and a three-line derivation with no value handed over. Phase 4 should build on these interaction types rather than forcing gradients into ChoiceCards.</p>
        <p className={styles.labNote}>Still untested: symbolic manipulation, where the learner rearranges an expression rather than evaluating one. That remains an open R&amp;D checkpoint.</p>
        <button className="primary-button" onClick={restart}>Replay the prototype</button>
      </div>
    );
  }

  return (
    <LessonPlayer
      kicker="Interaction lab"
      title="Lab: can this format teach gradient descent?"
      stepLabels={STEP_LABELS}
      currentStep={currentStep}
      highestUnlocked={highestUnlocked}
      onNavigate={goTo}
      onBack={() => goTo(Math.max(0, currentStep - 1))}
      onRestart={restart}
    >
      {screen}
    </LessonPlayer>
  );
}
