import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applyOperation,
  collect,
  describeOperation,
  divisionCaveats,
  equationSymbols,
  evaluateSide,
  formatEquation,
  formatSide,
  holdsFor,
  isSolvedFor,
  term,
  type Equation,
  type Operation,
} from "../../labs/symbolic-rearrangement/algebra";

/** e = w·x + b − y, the error of a one-parameter linear prediction. */
const START: Equation = {
  left: { numerator: [term(1, "e")], denominator: [] },
  right: { numerator: [term(1, "w", "x"), term(1, "b"), term(-1, "y")], denominator: [] },
};

const VALUES = { e: -1, w: 2, x: 3, b: 4, y: 11 };

function run(equation: Equation, operations: Operation[]) {
  return operations.reduce(applyOperation, equation);
}

describe("collect", () => {
  it("combines like terms and drops what cancels", () => {
    assert.deepEqual(collect([term(2, "w"), term(-2, "w"), term(3, "b")]), [term(3, "b")]);
  });

  it("treats a product as the same term regardless of the order it was written", () => {
    assert.deepEqual(collect([term(1, "w", "x"), term(1, "x", "w")]), [term(2, "w", "x")]);
  });

  it("leaves an explicit zero rather than an empty side", () => {
    assert.deepEqual(collect([term(1, "w"), term(-1, "w")]), [term(0)]);
  });
});

describe("rearranging keeps the equation true", () => {
  it("starts true for concrete values", () => {
    assert.equal(evaluateSide(START.left, VALUES), -1);
    assert.equal(evaluateSide(START.right, VALUES), -1);
    assert.equal(holdsFor(START, VALUES), true);
  });

  it("stays true after every single legal move, including useless ones", () => {
    const moves: Operation[] = [
      { kind: "subtract", term: term(1, "b") },
      { kind: "add", term: term(1, "y") },
      { kind: "divide", symbol: "x" },
      { kind: "multiply", symbol: "x" },
      { kind: "divide", symbol: "w" },
      { kind: "add", term: term(7) },
      { kind: "subtract", term: term(2, "b", "y") },
      { kind: "multiply", symbol: "y" },
    ];

    let equation = START;
    for (const move of moves) {
      equation = applyOperation(equation, move);
      assert.equal(holdsFor(equation, VALUES), true, `broke after: ${describeOperation(move)}`);
    }
  });

  it("stays true when a move is applied after a division", () => {
    const divided = applyOperation(START, { kind: "divide", symbol: "x" });
    const shifted = applyOperation(divided, { kind: "add", term: term(3, "b") });
    assert.equal(holdsFor(shifted, VALUES), true);
  });

  it("undoes a division by multiplying back", () => {
    const round = run(START, [{ kind: "divide", symbol: "x" }, { kind: "multiply", symbol: "x" }]);
    assert.equal(formatEquation(round), formatEquation(START));
  });
});

describe("isolating the target", () => {
  it("is not solved at the start", () => {
    assert.equal(isSolvedFor(START, "w"), false);
  });

  it("solves in the three intended moves", () => {
    const solved = run(START, [
      { kind: "subtract", term: term(1, "b") },
      { kind: "add", term: term(1, "y") },
      { kind: "divide", symbol: "x" },
    ]);

    assert.equal(isSolvedFor(solved, "w"), true);
    assert.equal(formatSide(solved.right), "w");
    assert.equal(formatSide(solved.left), "(e − b + y) / x");
    assert.equal(holdsFor(solved, VALUES), true);
    assert.equal(evaluateSide(solved.left, VALUES), VALUES.w);
  });

  it("accepts a longer route to the same place", () => {
    const solved = run(START, [
      { kind: "add", term: term(1, "y") },
      { kind: "multiply", symbol: "x" },
      { kind: "subtract", term: term(1, "b", "x") },
      { kind: "divide", symbol: "x" },
      { kind: "divide", symbol: "x" },
    ]);
    assert.equal(isSolvedFor(solved, "w"), true);
  });

  it("does not count a move that leaves the target on both sides", () => {
    const halfway = run(START, [{ kind: "subtract", term: term(1, "b") }, { kind: "add", term: term(1, "y") }]);
    assert.equal(isSolvedFor(halfway, "w"), false, "w·x is not w");

    const divided = applyOperation(halfway, { kind: "divide", symbol: "w" });
    assert.equal(isSolvedFor(divided, "w"), false);
  });

  it("cancels a divisor shared by every term instead of leaving a fraction", () => {
    const scaled = run(START, [{ kind: "multiply", symbol: "x" }, { kind: "divide", symbol: "x" }]);
    assert.deepEqual(scaled.left.denominator, []);
  });
});

describe("presentation", () => {
  it("writes the starting equation the way the lesson would", () => {
    assert.equal(formatEquation(START), "e = w·x + b − y");
  });

  it("uses a minus sign rather than a plus with a negative number", () => {
    assert.equal(formatSide({ numerator: [term(1, "e"), term(-1, "y")], denominator: [] }), "e − y");
  });

  it("hides a coefficient of one and shows any other", () => {
    assert.equal(formatSide({ numerator: [term(1, "w"), term(3, "b")], denominator: [] }), "w + 3b");
  });

  it("brackets a multi-term numerator and leaves a single term bare", () => {
    assert.equal(formatSide({ numerator: [term(1, "e"), term(1, "b")], denominator: ["x"] }), "(e + b) / x");
    assert.equal(formatSide({ numerator: [term(1, "e")], denominator: ["x"] }), "e / x");
  });

  it("names the symbols in play", () => {
    assert.deepEqual(equationSymbols(START), ["b", "e", "w", "x", "y"]);
  });

  it("describes each move in words for the history and for screen readers", () => {
    assert.equal(describeOperation({ kind: "subtract", term: term(1, "b") }), "subtract b from both sides");
    assert.equal(describeOperation({ kind: "divide", symbol: "x" }), "divide both sides by x");
  });
});

describe("division caveats", () => {
  it("reports every symbol the derivation assumed was non-zero", () => {
    assert.deepEqual(divisionCaveats([
      { kind: "subtract", term: term(1, "b") },
      { kind: "divide", symbol: "x" },
      { kind: "divide", symbol: "x" },
      { kind: "divide", symbol: "w" },
    ]), ["w", "x"]);
  });

  it("reports nothing when no division happened", () => {
    assert.deepEqual(divisionCaveats([{ kind: "add", term: term(1, "y") }]), []);
  });

  it("refuses to evaluate a side whose divisor is zero", () => {
    const divided = applyOperation(START, { kind: "divide", symbol: "x" });
    assert.equal(evaluateSide(divided.left, { ...VALUES, x: 0 }), null);
    assert.equal(holdsFor(divided, { ...VALUES, x: 0 }), null);
  });
});
