"use client";

import { useEffect, useMemo, useState } from "react";

const STEP_LABELS = [
  "The mystery",
  "Invent a rule",
  "Is the number special?",
  "Break the agreement",
  "See the bits",
  "Prove the idea",
  "Complete",
];

const PLACE_VALUES = [128, 64, 32, 16, 8, 4, 2, 1];
const STORAGE_KEY = "llm-zero:lesson-01:v1";

type BitPhase = "build" | "explain" | "play";
type ConventionAnswer = "yes" | "no" | null;
type FinalAnswer = "letter" | "representation" | null;

type PersistedLessonState = {
  currentStep: number;
  highestUnlocked: number;
  introGuess: string | null;
  numberDraft: string;
  agreedNumber: number;
  conventionAnswer: ConventionAnswer;
  sendRevealed: boolean;
  labBits: string[];
  bitPhase: BitPhase;
  hasFlippedBit: boolean;
  finalAnswer: FinalAnswer;
};

function toBits(value: number) {
  return value.toString(2).padStart(8, "0").slice(-8).split("");
}

function bitsToNumber(bits: string[]) {
  return parseInt(bits.join(""), 2);
}

function emptyBits() {
  return Array(8).fill("0") as string[];
}

function isBitArray(value: unknown): value is string[] {
  return Array.isArray(value)
    && value.length === 8
    && value.every((bit) => bit === "0" || bit === "1");
}

function clampStep(value: number, highestUnlocked: number) {
  return Math.min(
    Math.max(Math.round(value), 0),
    Math.max(0, Math.min(highestUnlocked, STEP_LABELS.length - 1)),
  );
}

function readStepFromUrl() {
  const raw = new URL(window.location.href).searchParams.get("step");
  if (raw === null) return null;
  const parsed = Number(raw);
  if (!Number.isInteger(parsed)) return null;
  return parsed - 1;
}

function writeStepToUrl(step: number, mode: "push" | "replace") {
  const url = new URL(window.location.href);
  url.searchParams.set("step", String(step + 1));
  if (mode === "push") {
    window.history.pushState({ lessonStep: step }, "", url);
  } else {
    window.history.replaceState({ lessonStep: step }, "", url);
  }
}

function readSavedState(): Partial<PersistedLessonState> | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

export default function Home() {
  const [hasHydrated, setHasHydrated] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [highestUnlocked, setHighestUnlocked] = useState(0);
  const [introGuess, setIntroGuess] = useState<string | null>(null);
  const [numberDraft, setNumberDraft] = useState("65");
  const [agreedNumber, setAgreedNumber] = useState(65);
  const [conventionAnswer, setConventionAnswer] = useState<ConventionAnswer>(null);
  const [sendRevealed, setSendRevealed] = useState(false);
  const [labBits, setLabBits] = useState<string[]>(() => emptyBits());
  const [bitPhase, setBitPhase] = useState<BitPhase>("build");
  const [hasFlippedBit, setHasFlippedBit] = useState(false);
  const [finalAnswer, setFinalAnswer] = useState<FinalAnswer>(null);

  const labNumber = useMemo(() => bitsToNumber(labBits), [labBits]);
  const receiverSymbol = "G";
  const targetBits = useMemo(() => toBits(agreedNumber), [agreedNumber]);
  const activePlaceValues = useMemo(
    () => PLACE_VALUES.filter((_, index) => targetBits[index] === "1"),
    [targetBits],
  );

  useEffect(() => {
    const saved = readSavedState();
    const restoredHighest = clampStep(
      typeof saved?.highestUnlocked === "number" ? saved.highestUnlocked : 0,
      STEP_LABELS.length - 1,
    );
    const restoredAgreedNumber = Math.max(
      0,
      Math.min(255, Math.round(typeof saved?.agreedNumber === "number" ? saved.agreedNumber : 65)),
    );
    const requestedStep = readStepFromUrl();
    const restoredCurrent = clampStep(
      requestedStep ?? (typeof saved?.currentStep === "number" ? saved.currentStep : 0),
      restoredHighest,
    );

    setHighestUnlocked(restoredHighest);
    setCurrentStep(restoredCurrent);
    setIntroGuess(typeof saved?.introGuess === "string" ? saved.introGuess : null);
    setNumberDraft(typeof saved?.numberDraft === "string" ? saved.numberDraft : String(restoredAgreedNumber));
    setAgreedNumber(restoredAgreedNumber);
    setConventionAnswer(saved?.conventionAnswer === "yes" || saved?.conventionAnswer === "no" ? saved.conventionAnswer : null);
    setSendRevealed(saved?.sendRevealed === true);
    setLabBits(isBitArray(saved?.labBits) ? saved.labBits : emptyBits());
    setBitPhase(saved?.bitPhase === "explain" || saved?.bitPhase === "play" ? saved.bitPhase : "build");
    setHasFlippedBit(saved?.hasFlippedBit === true);
    setFinalAnswer(
      saved?.finalAnswer === "letter" || saved?.finalAnswer === "representation"
        ? saved.finalAnswer
        : null,
    );
    writeStepToUrl(restoredCurrent, "replace");
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;

    const state: PersistedLessonState = {
      currentStep,
      highestUnlocked,
      introGuess,
      numberDraft,
      agreedNumber,
      conventionAnswer,
      sendRevealed,
      labBits,
      bitPhase,
      hasFlippedBit,
      finalAnswer,
    };

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // The lesson remains usable in privacy modes where local storage is unavailable.
    }
  }, [
    hasHydrated,
    currentStep,
    highestUnlocked,
    introGuess,
    numberDraft,
    agreedNumber,
    conventionAnswer,
    sendRevealed,
    labBits,
    bitPhase,
    hasFlippedBit,
    finalAnswer,
  ]);

  useEffect(() => {
    if (!hasHydrated) return;

    function handlePopState() {
      const requested = readStepFromUrl();
      if (requested === null) return;
      const safeStep = clampStep(requested, highestUnlocked);
      setCurrentStep(safeStep);
      if (safeStep !== requested) writeStepToUrl(safeStep, "replace");
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [hasHydrated, highestUnlocked]);

  function unlock(step: number) {
    setHighestUnlocked((current) => Math.max(current, step));
  }

  function goTo(step: number) {
    if (step > highestUnlocked || step < 0) return;
    setCurrentStep(step);
    if (hasHydrated) writeStepToUrl(step, "push");
  }

  function unlockAndGo(step: number) {
    unlock(step);
    setCurrentStep(step);
    if (hasHydrated) writeStepToUrl(step, "push");
  }

  function commitNumber() {
    const parsed = Number(numberDraft);
    if (!Number.isFinite(parsed)) return;
    const safe = Math.max(0, Math.min(255, Math.round(parsed)));
    setAgreedNumber(safe);
    setNumberDraft(String(safe));
    setLabBits(emptyBits());
    setBitPhase("build");
    setHasFlippedBit(false);
    setSendRevealed(false);
    setConventionAnswer(null);
    unlockAndGo(2);
  }

  function toggleBuildBit(index: number) {
    setLabBits((current) => current.map((bit, bitIndex) => (
      bitIndex === index ? (bit === "0" ? "1" : "0") : bit
    )));
  }

  function startExplanation() {
    setLabBits(targetBits);
    setBitPhase("explain");
  }

  function startFreePlay() {
    setLabBits(targetBits);
    setBitPhase("play");
    setHasFlippedBit(false);
  }

  function flipBit(index: number) {
    setLabBits((current) => current.map((bit, bitIndex) => (
      bitIndex === index ? (bit === "0" ? "1" : "0") : bit
    )));
    setHasFlippedBit(true);
    unlock(5);
  }

  function restartLesson() {
    setCurrentStep(0);
    setHighestUnlocked(0);
    setIntroGuess(null);
    setNumberDraft("65");
    setAgreedNumber(65);
    setConventionAnswer(null);
    setSendRevealed(false);
    setLabBits(emptyBits());
    setBitPhase("build");
    setHasFlippedBit(false);
    setFinalAnswer(null);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // The in-memory reset still succeeds if storage is unavailable.
    }
    if (hasHydrated) writeStepToUrl(0, "replace");
  }

  const buildDifference = agreedNumber - labNumber;
  const buildSolved = labNumber === agreedNumber;

  if (!hasHydrated) {
    return <main className="app-shell" aria-busy="true" />;
  }

  return (
    <main className="app-shell">
      <header className="site-header">
        <button className="brand brand-button" onClick={restartLesson} aria-label="Restart LLM Zero lesson">
          <span className="brand-mark">0</span>
          <span>LLM Zero</span>
        </button>
        <div className="header-meta">
          <span className="open-badge">Open source</span>
          <a href="https://github.com/ss-sonic/LLM-Zero" target="_blank" rel="noreferrer">GitHub ↗</a>
        </div>
      </header>

      <nav className="lesson-progress" aria-label="Lesson progress">
        <div className="progress-copy">
          <span>Lesson 01</span>
          <b>How computers represent text</b>
        </div>
        <div className="progress-track">
          {STEP_LABELS.map((label, index) => {
            const unlocked = index <= highestUnlocked;
            const complete = index < highestUnlocked;
            const current = index === currentStep;
            return (
              <div className="progress-item" key={label}>
                <button
                  className={`progress-dot${current ? " current" : ""}${complete ? " complete" : ""}`}
                  onClick={() => goTo(index)}
                  disabled={!unlocked}
                  aria-label={`${label}${unlocked ? "" : ", locked"}`}
                  aria-current={current ? "step" : undefined}
                  title={unlocked ? label : "Complete the previous step to unlock"}
                >
                  {complete ? "✓" : unlocked ? index + 1 : "·"}
                </button>
                {index < STEP_LABELS.length - 1 && <span className={complete ? "progress-line filled" : "progress-line"} />}
              </div>
            );
          })}
        </div>
      </nav>

      <section className={`lesson-stage ${currentStep === 4 ? "dark-stage" : ""}`}>
        <div className="stage-inner" key={currentStep}>
          {currentStep === 0 && (
            <div className="screen-layout mystery-screen">
              <div className="screen-copy">
                <p className="eyebrow">The mystery</p>
                <h1>How can the letter <span className="hero-a">A</span> exist inside a computer?</h1>
                <p className="lead">You can see an A. A computer cannot store the shape in the same way your brain sees it. So what do you think is really inside?</p>
              </div>
              <div className="question-card card">
                <p className="question-label">Make a guess. You do not need to know yet.</p>
                <div className="choice-stack">
                  {[
                    ["picture", "A tiny picture of the letter"],
                    ["number", "A number or pattern of 0s and 1s"],
                    ["meaning", "The computer somehow understands what A means"],
                  ].map(([value, label]) => (
                    <button
                      key={value}
                      className={introGuess === value ? "choice-card selected" : "choice-card"}
                      onClick={() => {
                        setIntroGuess(value);
                        unlock(1);
                      }}
                    >
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
                {introGuess && (
                  <div className="reveal-panel">
                    <b>Good. Keep that guess in your head.</b>
                    <span>We are going to build the answer ourselves instead of memorizing it.</span>
                    <button className="primary-button" onClick={() => unlockAndGo(1)}>Build the bridge →</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="screen-layout split-screen">
              <div className="screen-copy">
                <p className="eyebrow">Step 2 · Invent a rule</p>
                <h2>Suppose a computer is only willing to store numbers.</h2>
                <p className="lead">We want to store <strong>A</strong>. Pick any whole number from 0 to 255 to stand for it.</p>
                <p className="quiet-copy">There is no trick here. You are allowed to invent the rule.</p>
              </div>
              <div className="mapping-lab card">
                <span className="mapping-caption">Your private rule</span>
                <div className="mapping-equation">
                  <span className="mapping-symbol">A</span>
                  <span className="mapping-arrow">→</span>
                  <input
                    className="number-input"
                    type="number"
                    min="0"
                    max="255"
                    value={numberDraft}
                    onChange={(event) => setNumberDraft(event.target.value)}
                    aria-label="Choose a number for A"
                  />
                </div>
                <p>Try 7. Try 42. Try 201. Your choice is allowed.</p>
                <button
                  className="primary-button full-button"
                  disabled={numberDraft === "" || !Number.isFinite(Number(numberDraft))}
                  onClick={commitNumber}
                >
                  Use this rule →
                </button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="screen-layout centered-screen">
              <div className="screen-copy centered-copy">
                <p className="eyebrow">Step 3 · Question the rule</p>
                <h2>You chose <span className="inline-token">A → {agreedNumber}</span></h2>
                <p className="lead">Is {agreedNumber} somehow naturally connected to the letter A?</p>
              </div>
              <div className="binary-choice-row">
                <button
                  className={conventionAnswer === "yes" ? "big-choice selected" : "big-choice"}
                  onClick={() => setConventionAnswer("yes")}
                >
                  <b>Yes</b>
                  <span>The number must contain something about A.</span>
                </button>
                <button
                  className={conventionAnswer === "no" ? "big-choice selected" : "big-choice"}
                  onClick={() => {
                    setConventionAnswer("no");
                    unlock(3);
                  }}
                >
                  <b>No</b>
                  <span>We simply decided what the number means.</span>
                </button>
              </div>
              {conventionAnswer === "yes" && (
                <div className="feedback nudge">Try changing the number in your imagination. Could A have been 7 instead? If yes, the number itself cannot be special.</div>
              )}
              {conventionAnswer === "no" && (
                <div className="feedback success-feedback">
                  <div><b>Exactly.</b><span>The number is an identifier because we agreed to use it that way.</span></div>
                  <button className="primary-button" onClick={() => unlockAndGo(3)}>Now break the agreement →</button>
                </div>
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div className="screen-layout centered-screen wide-screen">
              <div className="screen-copy centered-copy compact-copy">
                <p className="eyebrow">Step 4 · Two computers</p>
                <h2>What if they agree on the number, but disagree on what it means?</h2>
                <p className="lead">Computer 1 invented <strong>A → {agreedNumber}</strong>. Computer 2 independently invented <strong>{receiverSymbol} → {agreedNumber}</strong>.</p>
              </div>

              <div className="computer-experiment">
                <div className="computer card">
                  <span className="computer-title">Computer 1 · sender</span>
                  <div className="screen">
                    <span className="screen-symbol">A</span>
                    <code>A → {agreedNumber}</code>
                  </div>
                </div>

                <div className="transmission">
                  <span className="packet">{agreedNumber}</span>
                  <span className="wire-line">→</span>
                  <small>Only the number travels</small>
                </div>

                <div className="computer card">
                  <span className="computer-title">Computer 2 · receiver</span>
                  <div className="screen receiver-screen">
                    <span className="screen-symbol">{sendRevealed ? receiverSymbol : "?"}</span>
                    <code>{receiverSymbol} → {agreedNumber}</code>
                  </div>
                </div>
              </div>

              {!sendRevealed ? (
                <button
                  className="primary-button experiment-button"
                  onClick={() => {
                    setSendRevealed(true);
                    unlock(4);
                  }}
                >
                  Send {agreedNumber} →
                </button>
              ) : (
                <div className="feedback mismatch-feedback">
                  <div>
                    <b>Computer 2 reads {receiverSymbol}, not A.</b>
                    <span>The same number can mean different things under different rules. Communication works only when the interpretation is shared.</span>
                  </div>
                  <button className="primary-button" onClick={() => unlockAndGo(4)}>So what gets stored? →</button>
                </div>
              )}
            </div>
          )}

          {currentStep === 4 && (
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
                      {PLACE_VALUES.map((value) => <span key={value}>+{value}</span>)}
                    </div>
                    <div className="bits" aria-label={`Your binary value ${labBits.join("")}, total ${labNumber}`}>
                      {labBits.map((bit, index) => (
                        <button
                          key={index}
                          onClick={() => toggleBuildBit(index)}
                          className={bit === "1" ? "bit on" : "bit"}
                          aria-label={`${bit === "1" ? "Remove" : "Add"} ${PLACE_VALUES[index]}, currently ${bit}`}
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
                        <button className="primary-button light-button" onClick={startExplanation}>Show the calculation →</button>
                      </div>
                    )}
                  </>
                )}

                {bitPhase === "explain" && (
                  <div className="binary-explanation">
                    <div className="calculation-grid" aria-label={`Binary calculation for ${agreedNumber}`}>
                      {PLACE_VALUES.map((value, index) => (
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

                    <button className="primary-button light-button explanation-next" onClick={startFreePlay}>I get it — let me change a bit →</button>
                  </div>
                )}

                {bitPhase === "play" && (
                  <>
                    <div className="bit-values" aria-hidden="true">
                      {PLACE_VALUES.map((value) => <span key={value}>{value}</span>)}
                    </div>
                    <div className="bits" aria-label={`Binary value ${labBits.join("")}`}>
                      {labBits.map((bit, index) => (
                        <button
                          key={index}
                          onClick={() => flipBit(index)}
                          className={bit === "1" ? "bit on" : "bit"}
                          aria-label={`Bit worth ${PLACE_VALUES[index]}, currently ${bit}`}
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
                        <button
                          className="primary-button light-button"
                          onClick={() => {
                            setLabBits(targetBits);
                            unlockAndGo(5);
                          }}
                        >
                          Continue →
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="screen-layout centered-screen">
              <div className="screen-copy centered-copy">
                <p className="eyebrow">Final check</p>
                <h2>So does the computer literally store the letter A?</h2>
                <p className="lead">Choose the statement that matches what you just discovered.</p>
              </div>
              <div className="final-choices">
                <button
                  className={finalAnswer === "letter" ? "big-choice selected" : "big-choice"}
                  onClick={() => setFinalAnswer("letter")}
                >
                  <b>Yes</b>
                  <span>Somewhere inside memory there is an actual A.</span>
                </button>
                <button
                  className={finalAnswer === "representation" ? "big-choice selected" : "big-choice"}
                  onClick={() => {
                    setFinalAnswer("representation");
                    unlock(6);
                  }}
                >
                  <b>No</b>
                  <span>It stores a representation that our rules tell us to interpret as A.</span>
                </button>
              </div>
              {finalAnswer === "letter" && (
                <div className="feedback nudge">Remember what traveled between the two computers: only a number. The meaning came from the rule used to interpret it.</div>
              )}
              {finalAnswer === "representation" && (
                <div className="feedback success-feedback">
                  <div><b>That is the idea.</b><span>You have the first building block.</span></div>
                  <button className="primary-button" onClick={() => unlockAndGo(6)}>Finish lesson →</button>
                </div>
              )}
            </div>
          )}

          {currentStep === 6 && (
            <div className="screen-layout complete-screen">
              <div className="completion-mark">✓</div>
              <p className="eyebrow">Lesson 01 complete</p>
              <h2>Symbols do not magically live inside computers.</h2>
              <p className="lead completion-lead">Humans define representations. Computers store the representation. Shared rules let us turn it back into something meaningful.</p>

              <div className="final-pipeline" aria-label="Representation pipeline">
                <div><small>Human sees</small><b>A</b></div>
                <span>→</span>
                <div><small>We agree on</small><b>{agreedNumber}</b></div>
                <span>→</span>
                <div><small>Computer stores</small><b className="binary-small">{targetBits.join("")}</b></div>
              </div>

              <div className="next-lesson-card">
                <div>
                  <small>Next mystery</small>
                  <h3>What if every computer invents its own table?</h3>
                  <p>That problem is why shared character standards had to exist.</p>
                </div>
                <span className="locked-pill">🔒 Lesson 02 · ASCII</span>
              </div>

              <button className="text-link-button" onClick={restartLesson}>Replay this lesson</button>
            </div>
          )}
        </div>
      </section>

      <div className="stage-footer" aria-label="Lesson navigation">
        <button className="back-button" onClick={() => goTo(Math.max(0, currentStep - 1))} disabled={currentStep === 0}>← Back</button>
        <span>{currentStep + 1} / {STEP_LABELS.length}</span>
        <span className="footer-hint">Complete this screen to unlock the next one.</span>
      </div>
    </main>
  );
}