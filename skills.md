# LLM Zero contributor skills and guardrails

This file is a working contract for human and AI contributors. Read it together with `CONTRIBUTING.md`, `README.md`, and `ROADMAP.md` before changing curriculum or lesson infrastructure.

## 1. Teach from the problem, not the vocabulary

A lesson should begin with the concrete problem that caused an idea to be invented. Do not lead with terminology, definitions, or a finished abstraction.

Preferred learning loop:

1. Ask one concrete question.
2. Let the learner predict.
3. Let them manipulate or break something.
4. Make the failure or constraint visible.
5. Introduce the smallest idea that resolves it.
6. Let them use the idea themselves.
7. End with one precise mental model and one natural next question.

Do not teach ahead. If a lesson is about character representation, do not casually jump into tokenization. If a lesson is about vectors, do not jump into attention.

## 2. Optimize for a curious 14-year-old without lying

Use simple language, but preserve technical truth. Remove jargon before removing mechanics. When a statement is a convention, call it a convention. When something follows from mathematics or engineering constraints, distinguish that explicitly.

A learner should be able to ask “why this exact value?” and find an answer in the lesson rather than encountering a magical transformation.

## 3. Respect the architecture boundaries

### `app/`

Routes and site-level metadata only. Lesson route files must remain thin. Do not put lesson experiments, progression state, or curriculum prose directly in `app/page.tsx` or route files.

### `components/lesson/`

Reusable learning application chrome: lesson header, progress rail, stage, footer, screen navigation shell. These components must not know about ASCII, binary, vectors, attention, or any other lesson-specific concept.

### `components/ui/`

Small genuinely repeated UI primitives. Do not manufacture generic components merely to reduce line count.

### `curriculum/`

The teaching material. Every lesson owns its content, experiments, completion conditions, and lesson-specific styles. A new lesson should normally live at:

```text
curriculum/<number>-<slug>/
├── lesson.tsx
├── config.ts
├── types.ts
├── styles.css
└── steps/
```

### `lib/lesson/`

Non-visual lesson mechanics that are genuinely reusable: persistence, URL navigation, progress guards, and small pure utilities. Lesson-specific domain logic belongs with the lesson until another lesson truly needs it.

## 4. Standardize the learning framework, not every experiment

The lesson shell is reusable because every guided lesson needs progress, back navigation, locked future screens, persistence, and overflow behavior.

The binary builder is not a generic “visualization engine.” It remains inside Lesson 01 until a second real use case proves an abstraction is useful.

Rule: **abstract after repetition, not in anticipation of repetition.**

## 5. Preserve the progression contract

Guided lessons are state machines.

- A learner may freely revisit unlocked screens.
- Future screens remain locked until the current completion condition is met.
- Wrong answers should normally teach or nudge, not punish or reset progress.
- The URL represents **where the learner is now**.
- Persisted lesson state represents **how far the learner has genuinely progressed**.
- Manually editing the URL must never unlock a future screen.
- Refreshing or reopening a lesson should restore meaningful in-screen state, not only the screen number.
- An explicit replay/restart action must clear that lesson's saved state.

## 6. Preserve the screen-based application model

Inside a guided lesson:

- header stays visible;
- progress stays visible;
- footer stays visible;
- only the lesson canvas scrolls when content overflows;
- the footer must not overlap lesson content;
- use `100dvh`/bounded layout rather than a naïve fixed footer.

The course homepage is a normal document and may scroll normally.

## 7. Interaction must carry instructional weight

Before adding an animation, drag interaction, modal, or game mechanic, answer: **what misconception does this interaction make impossible or easier to notice?**

Good interaction examples:

- build a target value before revealing the answer;
- send a value between two machines and watch a mapping mismatch happen;
- flip a bit and see a numeric consequence;
- predict an output before revealing it.

### Questions must win the visual hierarchy

Whenever the learner is expected to predict, choose, or explain something, the question must be one of the strongest visual elements on the screen. Do not make answer-card titles visually louder than the prompt they answer.

Do not reveal the conclusion in a headline before the learner has had a chance to discover it. The preferred order is:

1. context;
2. dominant question or task;
3. evidence / experiment;
4. choices or action;
5. feedback;
6. only then reveal the principle.

If an interaction creates a new decision halfway through a screen, give that new question fresh visual emphasis instead of reusing a tiny helper label.

Decorative motion is secondary. Respect `prefers-reduced-motion`.

## 8. Accessibility and responsive behavior are part of correctness

Interactive controls need keyboard access and meaningful accessible names. Do not rely on color alone. Test narrow screens and short laptop viewports. Expanded content must remain reachable without hiding navigation.

## 9. Content accuracy

When introducing standards, history, or precise implementation details, prefer primary specifications and authoritative sources. Keep citations or source notes close to the lesson/content work that relies on them.

Never blur these distinctions:

- character vs code point;
- code point vs encoding;
- encoding vs bytes;
- bytes vs bits;
- convention vs mathematical consequence;
- model representation vs semantic meaning.

## 10. New lesson checklist

Before marking a lesson available:

- add metadata to `curriculum/registry.ts`;
- create its lesson folder and step files;
- keep the route in `app/lessons/[lessonSlug]/page.tsx` thin;
- define explicit unlock conditions;
- persist only state needed to meaningfully resume;
- make Back/Forward and refresh safe;
- test keyboard and mobile behavior;
- run `npm run lint` and `npm run build`;
- update `ROADMAP.md` when lesson status changes.

## 11. AI contributor workflow

AI agents should not assume an existing abstraction is correct simply because it exists. Inspect the target lesson and its neighboring layers first.

Before editing:

1. Read `CONTRIBUTING.md` and this file.
2. Inspect `curriculum/registry.ts`.
3. Inspect the target lesson's `lesson.tsx`, `steps/`, and styles.
4. Identify the learner problem the change addresses.
5. Keep unrelated curriculum concepts out of scope.

After editing:

1. Check architecture boundaries.
2. Check that progression cannot be bypassed.
3. Check refresh/resume behavior if state changed.
4. Check responsive overflow behavior if layout changed.
5. Run type-check/build CI.

When uncertain, prefer a small lesson-specific implementation over a premature framework abstraction.
