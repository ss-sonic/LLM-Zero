"use client";

import { useMemo, useState } from "react";
import { LessonPlayer } from "../../components/lesson/LessonPlayer";
import { Feedback } from "../../components/ui/Feedback";
import { QuestionPrompt } from "../../components/ui/QuestionPrompt";
import styles from "./GradientDescentLab.module.css";

const STEP_LABELS = ["Scrub the weight", "Probe direction", "Apply an update", "Complete"];
const X_VALUE = 2;
const TARGET = 10;

function prediction(weight: number) {
  return X_VALUE * weight;
}

function loss(weight: number) {
  return (prediction(weight) - TARGET) ** 2;
}

function format(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

function LossChart({ weight }: { weight: number }) {
  const points = useMemo(() => Array.from({ length: 91 }, (_, index) => {
    const w = -1 + index * .1;
    const x = 32 + ((w + 1) / 9) * 556;
    const y = 210 - (loss(w) / 144) * 176;
    return `${x},${y}`;
  }).join(" "), []);
  const x = 32 + ((weight + 1) / 9) * 556;
  const y = 210 - (loss(weight) / 144) * 176;

  return (
    <div className={styles.chartWrap} aria-label="Loss curve as the weight changes">
      <svg viewBox="0 0 620 240" role="img">
        <line x1="32" y1="210" x2="592" y2="210" stroke="currentColor" opacity=".2" />
        <line x1="32" y1="28" x2="32" y2="210" stroke="currentColor" opacity=".2" />
        <polyline points={points} fill="none" stroke="currentColor" strokeWidth="3" opacity=".72" />
        <circle cx={x} cy={y} r="7" fill="var(--accent)" stroke="var(--ink)" strokeWidth="2" />
      </svg>
      <div className={styles.chartLabel}><span>w = -1</span><b>loss curve</b><span>w = 8</span></div>
    </div>
  );
}

export function GradientDescentLab() {
  const [currentStep, setCurrentStep] = useState(0);
  const [highestUnlocked, setHighestUnlocked] = useState(0);
  const [weight, setWeight] = useState(1);
  const [probedLeft, setProbedLeft] = useState(false);
  const [probedRight, setProbedRight] = useState(false);
  const [newWeight, setNewWeight] = useState("");
  const [updateChecked, setUpdateChecked] = useState(false);

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
    setProbedLeft(false);
    setProbedRight(false);
    setNewWeight("");
    setUpdateChecked(false);
  }

  const currentLoss = loss(weight);
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
                min="-1"
                max="8"
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
    const ready = probedLeft && probedRight;
    screen = (
      <div className={`screen-layout centered-screen ${styles.labScreen}`}>
        <QuestionPrompt
          eyebrow="Prototype · Direction from evidence"
          title="At w = 3, which direction makes the loss smaller?"
          lead="Do not pick an answer card. Probe both sides of the current value and compare the consequences."
        />
        <div className={styles.panel}>
          <div className={styles.metricGrid}>
            <div className={styles.metric}><small>current w</small><strong>3</strong></div>
            <div className={styles.metric}><small>prediction</small><strong>6</strong></div>
            <div className={styles.metric}><small>loss</small><strong>16</strong></div>
          </div>
          <div className={styles.probeRow}>
            <button className={styles.probe} onClick={() => setProbedLeft(true)}>
              <b>Probe w = 2.5</b><span>{probedLeft ? "prediction 5 · loss 25" : "See what happens to the loss"}</span>
            </button>
            <button className={styles.probe} onClick={() => setProbedRight(true)}>
              <b>Probe w = 3.5</b><span>{probedRight ? "prediction 7 · loss 9" : "See what happens to the loss"}</span>
            </button>
          </div>
        </div>
        {ready ? (
          <Feedback tone="success"><div><b>The evidence gives us a direction.</b><span>Moving right reduced loss from 16 to 9; moving left increased it to 25. A gradient will eventually encode this local direction numerically.</span></div><button className="primary-button" onClick={() => { unlock(2); setCurrentStep(2); }}>Try one numeric update →</button></Feedback>
        ) : null}
      </div>
    );
  } else if (currentStep === 2) {
    const numeric = Number(newWeight);
    const correct = updateChecked && Number.isFinite(numeric) && Math.abs(numeric - 4.6) < .001;
    screen = (
      <div className={`screen-layout centered-screen ${styles.labScreen}`}>
        <QuestionPrompt
          eyebrow="Prototype · Symbolic + numeric"
          title="Can the learner execute one gradient update instead of recognizing it?"
          lead="Assume a later lesson has derived gradient = −16. Use the update rule yourself with learning rate 0.1."
        />
        <div className={styles.equationCard}>
          <div className={styles.equation}>
            <span>wₙₑw = 3 − 0.1 × (−16) =</span>
            <input className={styles.numberInput} type="number" step="0.1" value={newWeight} onChange={(event) => { setNewWeight(event.target.value); setUpdateChecked(false); }} aria-label="New weight" />
          </div>
          <button className="primary-button" disabled={!newWeight.trim()} onClick={() => setUpdateChecked(true)}>Check the update →</button>
          {updateChecked && !correct ? <Feedback tone="nudge">Apply the signs carefully: subtracting a negative value moves w upward.</Feedback> : null}
          {correct ? (
            <>
              <Feedback tone="success"><div><b>Correct: w becomes 4.6.</b><span>One update cuts the loss from 16 to 0.64. This interaction combines algebra, numeric entry, and a visible consequence.</span></div></Feedback>
              <div className={styles.resultStrip}>
                <div><small>before</small><b>w = 3 · loss = 16</b></div><span>→</span><div><small>after</small><b>w = 4.6 · loss = 0.64</b></div>
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
        <h2>The lesson shell can carry continuous and symbolic work.</h2>
        <p className="lead completion-lead">The prototype used a live numeric scrubber, a loss curve, experimental probing, and explicit equation entry. Phase 4 should build on these interaction types rather than forcing gradients into ChoiceCards.</p>
        <button className="primary-button" onClick={restart}>Replay the prototype</button>
      </div>
    );
  }

  return (
    <LessonPlayer
      lessonNumber={0}
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
