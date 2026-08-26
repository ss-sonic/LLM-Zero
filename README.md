# LLM Zero

**Learn large language models from first principles — one small idea at a time.**

LLM Zero is a free, open-source, interactive curriculum for understanding how LLMs work from the absolute basics. The goal is to make the mechanics accessible to a curious teenager without sacrificing technical correctness.

Instead of starting with transformers, the curriculum starts with the problems computers had to solve first: how a symbol becomes data, why shared representations are necessary, how bytes and encodings work, and eventually how text becomes something a model can learn from.

## Teaching principles

1. **Problem before solution.** Experience why an idea is needed before learning its name.
2. **One concept at a time.** Do not hide missing foundations behind abstractions.
3. **Interaction over memorization.** Predict, manipulate, break, inspect, and rebuild.
4. **Simple language, precise ideas.** Beginner-friendly does not mean technically vague.
5. **Public by default.** The project is MIT-licensed and built as a public good.
6. **Retrieval beats re-reading.** Ideas come back days later at `/review`, not only during the lesson that built them.

## Current curriculum

Module 01 is **Text becomes data**.

Lesson 01 — **How computers represent text** — is complete and available at:

```text
/lessons/character-representation
```

The next lessons cover shared character tables, ASCII, breaking ASCII, Unicode, code points vs bytes, UTF-8, and encoding tradeoffs. Tokenization remains deliberately out of scope until the text-representation foundation is complete.

See [`ROADMAP.md`](./ROADMAP.md) for the full path.

## Spaced review

Retrieval inside a lesson happens minutes after the idea was built. `/review` brings each
idea back a day after you finish its lesson, then at widening intervals. Answers with a
determinate value are checked; explanations are never machine-graded — you commit, then
compare against the principle and judge your own recall. Anything you miss returns sooner.

## Interaction labs

`/labs/*` holds interaction prototypes that test whether the learning format can carry a
future concept before that concept enters the curriculum. Labs are routable but
deliberately unlinked from the course map: they are not lessons and are not
prerequisites:

- `/labs/gradient-descent` — continuous numeric work: scrub a parameter, watch a loss curve, carry a derivation.
- `/labs/symbolic-rearrangement` — symbolic work: apply operations to both sides and rearrange an equation rather than evaluate one.

## Repository architecture

```text
app/                         routes, metadata, course home
components/lesson/           reusable guided-lesson shell
components/review/           spaced-review surface
components/ui/               small proven UI primitives
curriculum/                  lesson content and experiments
  registry.ts                lesson metadata
  review.ts                  the ideas each lesson wants back
  01-character-representation/
    lesson.tsx
    config.ts
    types.ts
    styles.css
    steps/
labs/                        interaction prototypes (not curriculum)
lib/lesson/                  progression state machine, persistence, navigation, pure helpers
lib/course/                  course progress, review scheduling, feedback links
styles/                      cross-lesson shell/home styles
tests/                       mirrors the source tree
```

The key rule is: **standardize the learning framework, not every experiment.** Lesson-specific experiments stay with their lesson until a second real use case proves an abstraction is useful.

Human contributors should read [`CONTRIBUTING.md`](./CONTRIBUTING.md). AI contributors must also read [`skills.md`](./skills.md) and [`AGENTS.md`](./AGENTS.md).

## Local development

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

Quality checks:

```bash
npm run check   # type check + tests
npm run build
```

## License

MIT. See [`LICENSE`](./LICENSE).
