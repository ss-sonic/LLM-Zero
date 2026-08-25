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
7. Retrieve an earlier idea when the new situation genuinely depends on it.
8. End with one precise mental model and one natural next question.

Do not teach ahead. If a lesson is about character representation, do not casually jump into tokenization. If a lesson is about vectors, do not jump into attention.

## 2. Optimize for a curious 14-year-old without lying

Use simple language, but preserve technical truth. Remove jargon before removing mechanics. When a statement is a convention, call it a convention. When something follows from mathematics or engineering constraints, distinguish that explicitly.

A learner should be able to ask “why this exact value?” and find an answer in the lesson rather than encountering a magical transformation.

## 3. Respect the architecture boundaries

### `app/`

Routes and site-level metadata only. Lesson and lab route files must remain thin. Do not put experiments, progression state, or curriculum prose directly in route files.

### `components/lesson/`

Reusable learning application chrome: lesson header, progress rail, stage, footer, screen navigation shell. These components must not know about ASCII, binary, vectors, gradients, attention, or any other lesson-specific concept.

### `components/ui/`

Small genuinely repeated UI primitives. Current examples include question prompts, choice cards, feedback, and free-text recall. Do not manufacture a declarative lesson DSL merely to reduce line count.

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

### `labs/`

Experimental interaction prototypes used to test whether the learning format can carry future concepts before those concepts enter the curriculum. Labs are not prerequisites and should not silently become lessons.

### `lib/lesson/` and `lib/course/`

Non-visual mechanics that are genuinely reusable: persistence, URL navigation, progress guards, course progress, and small pure utilities. Lesson-specific domain logic belongs with the lesson until another real use case proves the abstraction useful.

## 4. Standardize the learning framework, not every experiment

The lesson shell is reusable because every guided lesson needs progress, back navigation, locked future screens, persistence, and overflow behavior.

The binary builder is not a generic “visualization engine.” A gradient loss curve is not a generic “math engine.” Keep domain interactions local until repetition proves otherwise.

Rule: **abstract after repetition, not in anticipation of repetition.**

Five lessons have now established a few stable repeated responsibilities. It is appropriate to reuse small primitives such as:

- `QuestionPrompt` for dominant teaching questions;
- `ChoiceCard` for genuine prediction/mental-model choices;
- `Feedback` for consequence-focused nudges and success;
- `TextRecall` for learner-produced recall.

Do not encode lesson pedagogy as JSON or force every step into one component signature. Extract stable responsibilities, not the lesson itself.

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

Before adding an animation, drag interaction, modal, graph, or game mechanic, answer: **what misconception does this interaction make impossible or easier to notice?**

Good interaction examples:

- build a target value before revealing the answer;
- send a value between two machines and watch a mapping mismatch happen;
- flip a bit and see a numeric consequence;
- scrub a parameter and watch a function/loss change continuously;
- type an intermediate mathematical result and see its downstream effect;
- predict an output before revealing it.

### Use the right assessment mode

Every meaningful check should be classified as one of these before implementation:

**Predict** — commit to an expectation before seeing the consequence. Choice cards can be excellent here when the distractors represent real misconceptions.

**Construct** — build, calculate, encode, arrange, manipulate, or produce the answer. Use this whenever the concept permits it.

**Recall** — retrieve an earlier idea without being shown the answer again, especially when a later lesson depends on it.

Recognition is useful for exposing a misconception. **Recognition alone is not proof of mastery.** A lesson completion check should normally require construction, recall, or both when the concept allows it.

Avoid the recurring multiple-choice tell where one option is naive, one is magical/overconfident, and one careful nuanced option is always correct. If a learner can pass by learning the test author's personality, redesign the check.

### Retrieval is part of the curriculum, not narration

Concepts must come back in new contexts. Saying “we rediscovered Lesson 02” is weaker than making the learner reconstruct the Lesson 02 principle.

From Lesson 04 onward, each lesson should look for at least one honest opportunity to retrieve a prior concept. It need not always be the immediately previous lesson. Do not insert artificial recall merely to satisfy a quota.

Good retrieval forms:

- explain a principle in one sentence;
- reconstruct a pipeline from blank slots;
- calculate with a rule learned earlier;
- diagnose a new failure using an old mental model;
- rebuild a prior result without showing the original table/answer.

### Questions must win the visual hierarchy

Whenever the learner is expected to predict, choose, construct, or explain something, the question must be one of the strongest visual elements on the screen. Do not make answer-card titles visually louder than the prompt they answer.

Do not reveal the conclusion in a headline before the learner has had a chance to discover it. The preferred order is:

1. context;
2. dominant question or task;
3. evidence / experiment;
4. learner action;
5. feedback;
6. only then reveal the principle.

If an interaction creates a new decision halfway through a screen, give that new question fresh visual emphasis instead of reusing a tiny helper label.

### Typography serves the lesson, not the poster

Large type should create hierarchy without crowding the experiment off-screen. On a normal laptop, aim for a primary teaching prompt to occupy roughly one to three balanced lines; four-line display headlines should be exceptional.

- Prefer tightening verbose prompt copy before shrinking it dramatically.
- Use balanced wrapping for prominent headings where supported.
- Short emotional statements may be larger than long reasoning questions.
- Do not force every lesson prompt into the same oversized display treatment.
- Check both width and vertical pressure on short laptop screens and mobile.

Decorative motion is secondary. Respect `prefers-reduced-motion`.

## 8. Build an interaction vocabulary that can survive the hard half

Do not force continuous or symbolic concepts into ChoiceCards merely because ChoiceCard already exists.

The curriculum should progressively support:

### Discrete
- choose/predict;
- sort;
- match;
- toggle;
- construct finite states.

### Recall / production
- free-text explanation;
- fill a missing rule;
- reconstruct a mental model;
- produce a previously learned mapping/result.

### Numeric
- scrub a value continuously;
- plot a live consequence;
- calculate an intermediate result;
- compare nearby values experimentally.

### Symbolic
- substitute into an equation;
- fill equation slots;
- arrange an expression;
- trace dependencies;
- carry a multi-step derivation.

### Code/build
- complete small functions;
- inspect tensors/arrays;
- change code and observe model behavior;
- eventually assemble complete working components.

Before Phase 4–6 interaction patterns are standardized, prototype them in `labs/` against real concepts. The gradient-descent lab is the first stress test.

## 9. Keep the LLM destination visible without teaching ahead

Bottom-up sequencing stays non-negotiable, but the learner should not lose sight of why the foundational work exists.

The course home should maintain a north-star pipeline from visible text through bytes, tokens, embeddings, neural computation, attention/transformers, and next-token prediction. Use it to show **where we are**, not to explain locked concepts early.

Do not add forced “this matters to LLMs because...” paragraphs to every screen. Motivation should come from the persistent map and from real causal dependencies.

## 10. Accessibility and responsive behavior are part of correctness

Interactive controls need keyboard access and meaningful accessible names. Do not rely on color alone. Test narrow screens and short laptop viewports. Expanded content must remain reachable without hiding navigation.

For graphs and live numeric interactions, expose the important numeric state in text as well; visuals must not be the only carrier of information.

## 11. Content accuracy and prerequisite closure

When introducing standards, history, or precise implementation details, prefer primary specifications and authoritative sources. Keep citations or source notes close to the lesson/content work that relies on them.

Never blur these distinctions:

- character vs code point;
- code point vs encoding;
- encoding vs bytes;
- bytes vs bits;
- convention vs mathematical consequence;
- identifier vs learned representation;
- model representation vs semantic meaning.

Do not defer a prerequisite without scheduling where it will be learned. If a lesson says “you do not need to know this yet,” the roadmap must contain the bridge before a later lesson depends on it. Hexadecimal byte notation is explicitly scheduled before hand-building UTF-8.

## 12. New lesson checklist

Before marking a lesson available:

- add metadata to `curriculum/registry.ts`;
- create its lesson folder and step files;
- keep the route in `app/lessons/[lessonSlug]/page.tsx` thin;
- state which checks are Predict, Construct, and Recall;
- include at least one production-oriented mastery check when the concept permits it;
- identify any genuine prior concept worth retrieving;
- define explicit unlock conditions;
- persist only state needed to meaningfully resume;
- make Back/Forward and refresh safe;
- check the north-star connection without teaching future vocabulary;
- test keyboard and mobile behavior;
- run `npm run lint` and `npm run build`;
- update `ROADMAP.md` when lesson status or prerequisites change.

## 13. AI contributor workflow

AI agents should not assume an existing abstraction is correct simply because it exists. Inspect the target lesson and its neighboring layers first.

Before editing:

1. Read `CONTRIBUTING.md` and this file.
2. Inspect `curriculum/registry.ts`.
3. Inspect the target lesson's `lesson.tsx`, `steps/`, and styles.
4. Identify the learner problem the change addresses.
5. Classify proposed checks as Predict / Construct / Recall.
6. Identify prerequisite and retrieval dependencies.
7. Keep unrelated curriculum concepts out of scope.

After editing:

1. Check architecture boundaries.
2. Check that progression cannot be bypassed.
3. Check refresh/resume behavior if state changed.
4. Check responsive overflow behavior if layout changed.
5. Check whether a learner can pass by test-taking pattern recognition rather than understanding.
6. Run type-check/build CI.

When uncertain, prefer a small lesson-specific implementation over a premature framework abstraction.
