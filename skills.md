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

Non-visual mechanics that are genuinely reusable: persistence, URL navigation, progress guards, course progress, spaced review scheduling, and small pure utilities. Lesson-specific domain logic belongs with the lesson until another real use case proves the abstraction useful.

`lib/lesson/useLessonProgress.ts` owns the guided-lesson state machine. A lesson must not re-implement hydration, URL syncing, clamping, persistence, Back/Forward handling, or replay — it passes its own state in and gets it handed back. The rules themselves are pure functions in `lib/lesson/progress.ts` so they are covered by tests rather than by inspection.

### `tests/`

Mirrors the source tree. Everything reusable and non-visual is tested here: the progression contract, persistence, review scheduling, the registry's internal consistency, every lesson's pure helpers, and the labs' engines. Run with `npm run test`; `npm run check` runs the type check and the tests together.

## 4. Standardize the learning framework, not every experiment

The lesson shell is reusable because every guided lesson needs progress, back navigation, locked future screens, persistence, and overflow behavior.

The binary builder is not a generic “visualization engine.” A gradient loss curve is not a generic “math engine.” Keep domain interactions local until repetition proves otherwise.

Rule: **abstract after repetition, not in anticipation of repetition.**

Five lessons have now established a few stable repeated responsibilities. It is appropriate to reuse small primitives such as:

- `QuestionPrompt` for dominant teaching questions;
- `ChoiceCard` for genuine prediction/mental-model choices;
- `Feedback` for consequence-focused nudges and success;
- `TextRecall` for learner-produced recall (commit → reveal → self-assess; never machine-graded).

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

### Ideas must come back after the session ends

Retrieval inside a lesson happens minutes after the idea was built, while it is still in the room. That is worth doing and it is not retention. Every lesson therefore declares the ideas it wants back, as `<LESSON>_REVIEW: ReviewPrompt[]` in its own `config.ts`, collected by `curriculum/review.ts` and scheduled by `lib/course/review.ts`.

A review prompt has to survive the lesson being closed:

- it may not lean on anything that was on screen at the time — state the context it needs;
- it may not contain its own answer (a test enforces this);
- `construct` prompts have a determinate answer and are machine-checked;
- `recall` prompts are prose and are never machine-checked, exactly as in a lesson.

Ideas return a day after the lesson is finished, then at expanding intervals. A missed retrieval drops that idea to the shortest interval rather than merely holding it — it is evidence the spacing outran the memory. Every available lesson must contribute at least one prompt.

### Never machine-grade free-text recall

Prose recall must use the commit → reveal → self-assess loop that `TextRecall`
implements: the learner writes an answer, commits it, and only then sees the canonical
principle beside what they wrote and judges their own recall. Either self-assessment
unlocks the next screen.

Do **not** gate progress on keyword or regex matching of a learner's sentence. It fails
in both directions — it rejects correct answers phrased in unexpected words and accepts
any sentence containing the expected ones — and it teaches learners to guess the author's
vocabulary, which is a worse version of the multiple-choice tell above because the target
is invisible. The retention benefit of retrieval comes from committing to an answer
before the reveal, not from being scored.

A learner can self-report generously. That is an accepted cost: the alternative is a
grader that lies about understanding prose. When a check genuinely must be verified by
the machine, make it a **construction** with a determinate answer — reconstruct a pipeline
from blank slots, calculate with an earlier rule, produce the number — not prose.

Do not remove the scaffolding lesson: a recall prompt should not name the answer's subject
or seed its first words in the placeholder. Ask what the earlier lesson proved; do not
hand back most of the sentence.

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

### Use the lesson canvas, not just its center

A one-screen lesson should feel composed across the available canvas, not like a compact card stack floating at 50% of a tall viewport.

- On tall desktop/laptop viewports, inspect how much of the lesson stage the prompt → experiment → action sequence actually occupies.
- If a short screen uses substantially less than the available stage height, give that lesson a deliberate vertical composition (for example a bounded minimum screen height and top-biased rhythm) instead of blindly inheriting center alignment.
- Do not add filler copy or giant headings merely to occupy space. Use spacing to clarify hierarchy between question, evidence, action, and feedback.
- Expanded states may become taller than initial states; they must grow naturally and remain scrollable rather than being squeezed to preserve artificial symmetry.
- Recheck both the shortest initial state and the tallest revealed/success state. A layout that looks balanced only after the learner has answered is still broken.

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

## 10. Find out whether it actually worked

Every lesson here is designed by principle and reviewed by principle. Nothing about that tells an author whether a screen lands, and a contributor's own fluency is the least reliable evidence available — the person who wrote the explanation cannot un-know it.

So every lesson screen carries a quiet link to a pre-filled issue form naming that exact screen (`components/lesson/LessonFeedback.tsx`). It is not analytics: nothing is collected, sent, or stored, and the learner decides whether to file anything. Keep it that way. If a future contributor wants usage data, that is a separate decision to be taken in public, not a quiet addition.

Treat `learner-feedback` issues as the highest-quality signal the project gets. A report of the form "I passed the check without understanding it" is a design defect, not a support request.

## 11. Accessibility and responsive behavior are part of correctness

Interactive controls need keyboard access and meaningful accessible names. Do not rely on color alone. Test narrow screens and short laptop viewports. Expanded content must remain reachable without hiding navigation.

For graphs and live numeric interactions, expose the important numeric state in text as well; visuals must not be the only carrier of information.

## 12. Content accuracy and prerequisite closure

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

## 13. New lesson checklist

Before marking a lesson available:

- add metadata to `curriculum/registry.ts`;
- create its lesson folder and step files;
- keep the route in `app/lessons/[lessonSlug]/page.tsx` thin;
- state which checks are Predict, Construct, and Recall;
- include at least one production-oriented mastery check when the concept permits it;
- identify any genuine prior concept worth retrieving;
- define explicit unlock conditions;
- drive progression through `useLessonProgress` rather than a hand-rolled state machine;
- persist only state needed to meaningfully resume;
- make Back/Forward and refresh safe;
- declare at least one review prompt so the lesson's ideas come back later;
- check the north-star connection without teaching future vocabulary;
- test tall desktop, short laptop, keyboard, and mobile behavior;
- cover any new pure helper in `tests/`;
- run `npm run check` and `npm run build`;
- update `ROADMAP.md` when lesson status or prerequisites change.

## 14. AI contributor workflow

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
6. Check that any rule worth stating in this file is enforced by a test rather than by review.
7. Run `npm run check` and `npm run build`.

When uncertain, prefer a small lesson-specific implementation over a premature framework abstraction.
