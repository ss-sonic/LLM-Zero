# Contributing to LLM Zero

Thank you for helping build LLM Zero.

This project is intended to be a long-term public good: a free, open-source path for understanding LLMs from first principles. Contributions should optimize for learner understanding before cleverness or feature count.

> **AI contributors:** read [`skills.md`](./skills.md) before making changes. It defines the architecture, lesson state-machine, persistence, pedagogy, and abstraction rules that generated contributions must preserve.

## The teaching bar

A contribution should ideally pass these tests:

- **Could a curious 14-year-old follow it?** Avoid unexplained jargon and hidden prerequisites.
- **Is it technically correct?** Simplify language, not the underlying truth.
- **Does the problem appear before the solution?** Let learners feel why an invention is needed before naming it.
- **Does it stay at one abstraction level?** Do not jump from bytes to tokenization, or vectors to attention, before the current concept is established.
- **Can the learner do something?** Prefer prediction, manipulation, inspection, experiments, and puzzles over long passive explanations.
- **Does the interaction teach?** Animation and interaction should reveal a concept, not merely decorate the page.

## Curriculum philosophy

Each lesson should generally follow this progression:

1. Ask one concrete question.
2. Expose the underlying problem.
3. Let the learner predict or experiment.
4. Introduce the smallest idea needed to solve the problem.
5. Let the learner manipulate that idea.
6. End with a concise mental model.
7. Leave one natural question that motivates the next lesson.

## Architecture contract

The repository has explicit ownership boundaries:

- `app/` — routes and site-level metadata. Keep lesson routes thin.
- `components/lesson/` — reusable lesson chrome and guided-navigation UI.
- `components/ui/` — small UI patterns that have proven reusable.
- `curriculum/` — lesson content, experiments, steps, and lesson-specific styling.
- `lib/lesson/` — non-visual reusable mechanics such as persistence, URL navigation, progress guards, and pure helpers.

A new lesson should normally live in `curriculum/<number>-<slug>/` with a `lesson.tsx`, `steps/`, configuration/types, and lesson-specific styles.

**Do not put new lessons into `app/page.tsx`. Do not turn a one-off experiment into a generic framework component before a second real use case exists.** Standardize the learning framework; keep experiments specific until repetition proves otherwise.

## Guided lesson behavior

Every guided lesson should preserve these rules:

- unlocked screens can be revisited freely;
- future screens cannot be skipped;
- wrong answers teach or nudge rather than punish;
- URL state represents the current screen;
- persisted state represents genuine progress and meaningful in-screen state;
- refreshing/reopening restores progress;
- changing the URL cannot unlock a future screen;
- header/progress/footer remain visible while only the lesson canvas scrolls on overflow.

See [`skills.md`](./skills.md) for the detailed implementation contract.

## Development

```bash
npm install
npm run dev
```

Before opening a pull request:

```bash
npm run lint
npm run build
```

## Pull requests

Keep pull requests focused. For educational changes, explain:

- what concept is being taught;
- what misconception or learning problem the change addresses;
- why the proposed interaction/explanation is appropriate for a beginner;
- what higher-level concepts have deliberately been kept out of scope.

For architecture changes, explain which directory owns the behavior and why it is genuinely reusable.

## Accessibility

Interactive learning should remain usable with keyboards, screen readers, reduced-motion preferences, and smaller screens wherever practical. Avoid relying on color alone to convey meaning.

## Content accuracy

When a lesson introduces a standard, historical claim, mathematical statement, or implementation detail, favor primary sources and specifications. Add sources to lesson notes when appropriate.

## Code style

Prefer straightforward React and TypeScript. Educational behavior should be easy for contributors to understand and modify. Avoid dependencies unless they materially improve the learning experience or maintainability.

## Community

Be constructive, curious, and precise. It is fine to challenge an explanation or implementation; focus criticism on the idea and provide reasoning that helps improve it.
