/**
 * A deliberately small symbolic core.
 *
 * The gradient-descent lab proved the format can carry continuous numeric work,
 * but it only ever *evaluates* an expression that is handed to the learner. Phases
 * 4–6 need something the curriculum has never prototyped: rearranging an
 * expression rather than computing one. This is the smallest engine that can do
 * that honestly.
 *
 * Each side of an equation is one fraction: a sum of terms over a product of
 * symbols. Every operation is applied to both sides, so the equation stays true
 * by construction — a learner cannot reach a false statement, only an unhelpful
 * one. That is the point: wrong moves are legal and simply fail to isolate the
 * target, which is what algebra actually feels like.
 */

export type Term = {
  coefficient: number;
  /** Sorted product of symbols; empty means a plain constant. */
  factors: string[];
};

export type Side = {
  numerator: Term[];
  /** Sorted product of symbols dividing the whole numerator. */
  denominator: string[];
};

export type Equation = { left: Side; right: Side };

export type Operation =
  | { kind: "add"; term: Term }
  | { kind: "subtract"; term: Term }
  | { kind: "divide"; symbol: string }
  | { kind: "multiply"; symbol: string };

export function term(coefficient: number, ...factors: string[]): Term {
  return { coefficient, factors: [...factors].sort() };
}

function termKey(value: Term) {
  return value.factors.join("*");
}

function multiplyTerm(value: Term, factors: string[]): Term {
  return { coefficient: value.coefficient, factors: [...value.factors, ...factors].sort() };
}

/** Combines like terms and drops anything that cancelled to zero. */
export function collect(numerator: Term[]): Term[] {
  const totals = new Map<string, Term>();

  for (const item of numerator) {
    const key = termKey(item);
    const existing = totals.get(key);
    if (existing) existing.coefficient += item.coefficient;
    else totals.set(key, { coefficient: item.coefficient, factors: [...item.factors] });
  }

  const collected = [...totals.values()].filter((item) => item.coefficient !== 0);
  if (collected.length === 0) return [term(0)];

  // Terms keep the order they were introduced in, so a rearranged side reads as a
  // record of the moves the learner made. Only bare constants are pushed to the
  // end, so a side reads "w + 3" rather than "3 + w".
  return [
    ...collected.filter((item) => item.factors.length > 0),
    ...collected.filter((item) => item.factors.length === 0),
  ];
}

function normalizeSide(side: Side): Side {
  const numerator = collect(side.numerator);
  const denominator = [...side.denominator].sort();

  // Cancel any symbol shared by the denominator and every numerator term.
  const remaining: string[] = [];
  let current = numerator;

  for (const symbol of denominator) {
    if (current.every((item) => item.factors.includes(symbol))) {
      current = current.map((item) => {
        const factors = [...item.factors];
        factors.splice(factors.indexOf(symbol), 1);
        return { coefficient: item.coefficient, factors };
      });
    } else {
      remaining.push(symbol);
    }
  }

  return { numerator: collect(current), denominator: remaining };
}

export function applyToSide(side: Side, operation: Operation): Side {
  switch (operation.kind) {
    case "add":
      // Adding t to N/D gives (N + t·D)/D — still one fraction, still exact.
      return normalizeSide({
        numerator: [...side.numerator, multiplyTerm(operation.term, side.denominator)],
        denominator: side.denominator,
      });
    case "subtract":
      return normalizeSide({
        numerator: [...side.numerator, multiplyTerm({ ...operation.term, coefficient: -operation.term.coefficient }, side.denominator)],
        denominator: side.denominator,
      });
    case "divide":
      return normalizeSide({ numerator: side.numerator, denominator: [...side.denominator, operation.symbol] });
    case "multiply":
      return normalizeSide({
        numerator: side.numerator.map((item) => multiplyTerm(item, [operation.symbol])),
        denominator: side.denominator,
      });
  }
}

export function applyOperation(equation: Equation, operation: Operation): Equation {
  return {
    left: applyToSide(equation.left, operation),
    right: applyToSide(equation.right, operation),
  };
}

export function sideSymbols(side: Side) {
  const symbols = new Set<string>();
  for (const item of side.numerator) for (const factor of item.factors) symbols.add(factor);
  for (const symbol of side.denominator) symbols.add(symbol);
  return [...symbols].sort();
}

export function equationSymbols(equation: Equation) {
  return [...new Set([...sideSymbols(equation.left), ...sideSymbols(equation.right)])].sort();
}

function isIsolated(side: Side, target: string) {
  return side.denominator.length === 0
    && side.numerator.length === 1
    && side.numerator[0].coefficient === 1
    && side.numerator[0].factors.length === 1
    && side.numerator[0].factors[0] === target;
}

/** Solved means the target stands alone on one side and appears nowhere on the other. */
export function isSolvedFor(equation: Equation, target: string) {
  const leftSolved = isIsolated(equation.left, target) && !sideSymbols(equation.right).includes(target);
  const rightSolved = isIsolated(equation.right, target) && !sideSymbols(equation.left).includes(target);
  return leftSolved || rightSolved;
}

/**
 * Dividing by a symbol is only valid when that symbol cannot be zero.
 *
 * The lab surfaces this rather than hiding it: a step that quietly assumes x ≠ 0
 * is exactly the kind of magic the curriculum refuses elsewhere.
 */
export function divisionCaveats(operations: readonly Operation[]) {
  return [...new Set(
    operations
      .filter((operation): operation is Extract<Operation, { kind: "divide" }> => operation.kind === "divide")
      .map((operation) => operation.symbol),
  )].sort();
}

export function evaluateSide(side: Side, values: Record<string, number>): number | null {
  let numerator = 0;
  for (const item of side.numerator) {
    let value = item.coefficient;
    for (const factor of item.factors) {
      const factorValue = values[factor];
      if (factorValue === undefined) return null;
      value *= factorValue;
    }
    numerator += value;
  }

  let denominator = 1;
  for (const symbol of side.denominator) {
    const symbolValue = values[symbol];
    if (symbolValue === undefined) return null;
    denominator *= symbolValue;
  }

  return denominator === 0 ? null : numerator / denominator;
}

/** Both sides must still agree numerically after every rearrangement. */
export function holdsFor(equation: Equation, values: Record<string, number>) {
  const left = evaluateSide(equation.left, values);
  const right = evaluateSide(equation.right, values);
  if (left === null || right === null) return null;
  return Math.abs(left - right) < 1e-9;
}

export function formatTerm(value: Term, isFirst: boolean) {
  const sign = value.coefficient < 0 ? "−" : "+";
  const magnitude = Math.abs(value.coefficient);
  const body = value.factors.length === 0
    ? String(magnitude)
    : `${magnitude === 1 ? "" : magnitude}${value.factors.join("·")}`;

  if (isFirst) return value.coefficient < 0 ? `−${body}` : body;
  return ` ${sign} ${body}`;
}

export function formatSide(side: Side) {
  const numerator = side.numerator.map((item, index) => formatTerm(item, index === 0)).join("");
  if (side.denominator.length === 0) return numerator;

  const wrapped = side.numerator.length > 1 ? `(${numerator})` : numerator;
  return `${wrapped} / ${side.denominator.join("·")}`;
}

export function formatEquation(equation: Equation) {
  return `${formatSide(equation.left)} = ${formatSide(equation.right)}`;
}

export function describeOperation(operation: Operation) {
  switch (operation.kind) {
    case "add": return `add ${formatTerm(operation.term, true)} to both sides`;
    case "subtract": return `subtract ${formatTerm(operation.term, true)} from both sides`;
    case "divide": return `divide both sides by ${operation.symbol}`;
    case "multiply": return `multiply both sides by ${operation.symbol}`;
  }
}
