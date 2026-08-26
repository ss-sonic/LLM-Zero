"use client";

import { useMemo, useState } from "react";
import { LessonPlayer } from "../../components/lesson/LessonPlayer";
import { Feedback } from "../../components/ui/Feedback";
import { QuestionPrompt } from "../../components/ui/QuestionPrompt";
import {
  applyOperation,
  describeOperation,
  divisionCaveats,
  equationSymbols,
  evaluateSide,
  formatEquation,
  formatSide,
  formatTerm,
  holdsFor,
  isSolvedFor,
  term,
  type Equation,
  type Operation,
  type Term,
} from "./algebra";
import styles from "./SymbolicLab.module.css";

const STEP_LABELS = ["The stuck equation", "Rearrange it", "Complete"];
const TARGET = "w";
const SHORTEST_ROUTE = 3;

/** e = w·x + b − y — the error of a one-parameter linear prediction. */
const START: Equation = {
  left: { numerator: [term(1, "e")], denominator: [] },
  right: { numerator: [term(1, "w", "x"), term(1, "b"), term(-1, "y")], denominator: [] },
};

/** Concrete values that satisfy the starting equation, used to check every step. */
const CHECK_VALUES: Record<string, number> = { e: -1, w: 2, x: 3, b: 4, y: 11 };

const SYMBOL_MEANINGS: Record<string, string> = {
  e: "the error we measured",
  w: "the weight — what we want",
  x: "the input",
  b: "the bias",
  y: "the value we wanted",
};

function termPalette(equation: Equation): Term[] {
  const seen = new Map<string, Term>();
  for (const side of [equation.left, equation.right]) {
    for (const item of side.numerator) {
      if (item.coefficient === 0) continue;
      const magnitude = { coefficient: Math.abs(item.coefficient), factors: item.factors };
      seen.set(`${magnitude.coefficient}|${magnitude.factors.join("*")}`, magnitude);
    }
  }
  return [...seen.values()];
}

export function SymbolicLab() {
  const [currentStep, setCurrentStep] = useState(0);
  const [highestUnlocked, setHighestUnlocked] = useState(0);
  const [guess, setGuess] = useState("");
  const [history, setHistory] = useState<Operation[]>([]);

  const equation = useMemo(() => history.reduce(applyOperation, START), [history]);
  const solved = isSolvedFor(equation, TARGET);
  // Whichever side the learner did not isolate is the expression for the target.
  const solutionSide = formatSide(equation.left) === TARGET ? equation.right : equation.left;
  const stillTrue = holdsFor(equation, CHECK_VALUES);
  const symbols = equationSymbols(equation);
  const palette = termPalette(equation);
  const caveats = divisionCaveats(history);

  function goTo(step: number) {
    if (step < 0 || step > highestUnlocked) return;
    setCurrentStep(step);
  }

  function unlockAndGo(step: number) {
    setHighestUnlocked((current) => Math.max(current, step));
    setCurrentStep(step);
  }

  function apply(operation: Operation) {
    setHistory((current) => [...current, operation]);
  }

  function restart() {
    setCurrentStep(0);
    setHighestUnlocked(0);
    setGuess("");
    setHistory([]);
  }

  let screen;

  if (currentStep === 0) {
    screen = (
      <div className="screen-layout centered-screen wide-screen">
        <QuestionPrompt
          level="h1"
          eyebrow="Interaction lab · symbolic manipulation"
          title="You know how wrong the prediction was. Can you get back to the weight that caused it?"
          lead="This is the shape of every training step: a parameter is buried inside an expression, and the thing you can measure is on the other side of the equals sign."
        />

        <div className={`card ${styles.introCard}`}>
          <div className={styles.equationLarge} aria-label={`The equation ${formatEquation(START)}`}>
            {formatEquation(START)}
          </div>
          <dl className={styles.legend}>
            {equationSymbols(START).map((symbol) => (
              <div key={symbol}>
                <dt>{symbol}</dt>
                <dd>{SYMBOL_MEANINGS[symbol]}</dd>
              </div>
            ))}
          </dl>
          <p className={styles.introNote}>
            Nothing here needs calculating. The task is to rewrite the equation until <b>{TARGET}</b> stands alone —
            you will apply operations to both sides, and the equation will stay true whatever you choose.
          </p>
        </div>

        <div className={styles.guessBlock}>
          <label htmlFor="move-guess">Before you start: how many operations do you think it takes?</label>
          <input
            id="move-guess"
            type="number"
            min={1}
            max={20}
            value={guess}
            onChange={(event) => setGuess(event.target.value)}
            placeholder="?"
          />
        </div>

        <button className="primary-button" disabled={guess.trim() === ""} onClick={() => unlockAndGo(1)}>
          Open the workbench →
        </button>
      </div>
    );
  } else if (currentStep === 1) {
    screen = (
      <div className="screen-layout centered-screen wide-screen">
        <QuestionPrompt
          eyebrow="Step 2 · Rearrange"
          title={<>Get <span className={styles.targetMark}>{TARGET}</span> alone on one side.</>}
          lead="Every operation applies to both sides at once, so the statement stays true no matter which you pick. A move that does not help is not an error — it just does not help."
        />

        <div className={`card ${styles.workbench}`}>
          <div className={styles.equationLarge} aria-live="polite" aria-label={`Current equation: ${formatEquation(equation)}`}>
            {formatSide(equation.left)}
            <span className={styles.equals}>=</span>
            {formatSide(equation.right)}
          </div>

          <div className={styles.checkRow}>
            <small>Numeric check</small>
            <span>
              with e = {CHECK_VALUES.e}, w = {CHECK_VALUES.w}, x = {CHECK_VALUES.x}, b = {CHECK_VALUES.b}, y = {CHECK_VALUES.y}
              {" → "}
              <b>{evaluateSide(equation.left, CHECK_VALUES) ?? "undefined"}</b>
              {" = "}
              <b>{evaluateSide(equation.right, CHECK_VALUES) ?? "undefined"}</b>
              {stillTrue === true ? " ✓ still true" : stillTrue === null ? " — undefined here" : " ✗"}
            </span>
          </div>

          <div className={styles.moves}>
            <div className={styles.moveGroup}>
              <small>Add or subtract a term</small>
              <div className={styles.moveRow}>
                {palette.map((item) => {
                  const label = formatTerm(item, true);
                  return (
                    <span className={styles.movePair} key={`${item.coefficient}|${item.factors.join("*")}`}>
                      <button onClick={() => apply({ kind: "subtract", term: item })} aria-label={`Subtract ${label} from both sides`}>− {label}</button>
                      <button onClick={() => apply({ kind: "add", term: item })} aria-label={`Add ${label} to both sides`}>+ {label}</button>
                    </span>
                  );
                })}
              </div>
            </div>

            <div className={styles.moveGroup}>
              <small>Divide or multiply by a symbol</small>
              <div className={styles.moveRow}>
                {symbols.map((symbol) => (
                  <span className={styles.movePair} key={symbol}>
                    <button onClick={() => apply({ kind: "divide", symbol })} aria-label={`Divide both sides by ${symbol}`}>÷ {symbol}</button>
                    <button onClick={() => apply({ kind: "multiply", symbol })} aria-label={`Multiply both sides by ${symbol}`}>× {symbol}</button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.historyRow}>
            <ol className={styles.history}>
              {history.length === 0
                ? <li className={styles.historyEmpty}>No moves yet.</li>
                : history.map((operation, index) => <li key={index}>{describeOperation(operation)}</li>)}
            </ol>
            <div className={styles.historyActions}>
              <button className="text-link-button" disabled={history.length === 0} onClick={() => setHistory((current) => current.slice(0, -1))}>Undo</button>
              <button className="text-link-button" disabled={history.length === 0} onClick={() => setHistory([])}>Start over</button>
            </div>
          </div>
        </div>

        {solved && (
          <>
            <Feedback tone="success">
              <div>
                <b>{TARGET} = {formatSide(solutionSide)}</b>
                <span>
                  You rearranged it in {history.length} {history.length === 1 ? "move" : "moves"}
                  {guess.trim() !== "" && ` — you guessed ${guess.trim()}`}. The shortest route is {SHORTEST_ROUTE}: subtract b, add y, divide by x.
                  Nothing was evaluated along the way; the same rewriting works for any values.
                </span>
              </div>
            </Feedback>

            {caveats.length > 0 && (
              <p className={styles.caveat}>
                One thing this derivation assumed: {caveats.map((symbol) => `${symbol} ≠ 0`).join(", ")}.
                Dividing by a symbol is only valid when it cannot be zero — and if the input {caveats.includes("x") ? "x" : caveats[0]} really were zero,
                the weight would leave no trace in the error at all, so there would be nothing to recover.
              </p>
            )}

            <button className="primary-button" onClick={() => unlockAndGo(2)}>What this prototype settles →</button>
          </>
        )}
      </div>
    );
  } else {
    screen = (
      <div className="screen-layout complete-screen">
        <div className="completion-mark">✓</div>
        <p className="eyebrow">Interaction prototype complete</p>
        <h2>The format can carry symbolic manipulation, not just evaluation.</h2>
        <p className="lead completion-lead">
          The learner chose operations and the equation was rewritten by rule — no answer was ever offered to recognise, and
          no step was graded against a hidden string. Correctness came from the algebra staying true, which the numeric check
          made visible at every stage.
        </p>
        <p className={styles.labNote}>
          What this unblocks: Phase 4 can ask for a derivation rather than a final number, and Phase 5 can ask a learner to
          rearrange an attention score before ever computing one. What it does not yet cover: expanding brackets, powers, and
          simultaneous constraints — a chain-rule screen will need at least the first two.
        </p>
        <button className="primary-button" onClick={restart}>Replay the prototype</button>
      </div>
    );
  }

  return (
    <LessonPlayer
      kicker="Interaction lab"
      title="Lab: can this format teach rearranging, not just calculating?"
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
