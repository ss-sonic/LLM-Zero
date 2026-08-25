# LLM Zero Roadmap

LLM Zero grows from the smallest representation concepts toward complete language-model systems. The sequence is intentionally bottom-up; later modules should not assume ideas that have not yet been earned by earlier lessons.

The roadmap tracks two things in parallel:

1. **concept progression** — what the learner understands;
2. **interaction capability** — what the learner can actively do to demonstrate that understanding.

## Phase 1 — Text becomes data

- [x] Lesson 01 — How can the letter A exist inside a computer?
- [x] Lesson 02 — Why do computers need a shared character table?
- [x] Lesson 03 — ASCII: one early shared agreement
- [x] Lesson 04 — Break ASCII with the world's languages
- [x] Lesson 05 — Unicode and code points
- [x] Lesson 06 — A code point is not a byte
- [ ] Foundation bridge — Hexadecimal as compact binary notation (`0000–1111 ↔ 0–F`)
- [ ] Lesson 07 — Build UTF-8 by hand
- [ ] Lesson 08 — UTF-8 vs UTF-16 vs UTF-32
- [ ] Challenge — Trace a multilingual sentence from symbols to bytes

**Interaction target:** prediction + discrete construction + cross-lesson recall + short learner-produced explanations.

**Retrofit debt.** Lessons 01–05 shipped before the assessment modes existed, so their
completion checks are still recognition-only. Lesson 04's private-fix recall is the
reference implementation. Outstanding:

Lesson 06 is the first lesson built to the new standard: two free-recall
retrievals, four constructions, and a single genuine prediction.

- [ ] Lesson 01 — `FinalCheck` is a two-card recognition check
- [ ] Lesson 03 — completion check is recognition-only
- [ ] Lesson 05 — `GlobalIdentityChallenge` matches against a table shown one screen earlier
- [ ] Lesson 02 — audit for one honest retrieval opportunity

## Phase 2 — Text becomes model input

- [ ] Why not feed raw characters directly?
- [ ] What is a token?
- [ ] Build a tiny word tokenizer
- [ ] Discover out-of-vocabulary problems
- [ ] Build byte-pair encoding from scratch
- [ ] Compare character, word, byte, and subword approaches
- [ ] Vocabulary size and sequence-length trade-offs
- [ ] Token IDs are identifiers, not meaning

**Interaction target:** manipulate real strings, construct vocabularies, execute merge rules, compare tokenizations, and retrieve the earlier “identifier ≠ meaning” distinction.

## Phase 3 — Numbers acquire learnable geometry

- [ ] Vectors from first principles
- [ ] Coordinates and dimensions
- [ ] Dot products
- [ ] Matrices and matrix multiplication
- [ ] From token IDs to embeddings
- [ ] Similarity and learned representation

**Interaction target:** numeric scrubbing, coordinate manipulation, live vector geometry, hand calculations, and matrix construction rather than recognition-only checks.

## Phase 4 — A tiny neural network learns

- [ ] Functions, parameters, and predictions
- [ ] Measuring error
- [ ] Derivatives and gradients
- [ ] Gradient descent
- [ ] Chain rule
- [ ] Backpropagation by hand
- [ ] Build and train a tiny network without hiding the math

**Interaction target:** live functions/plots, continuous parameter scrubbing, equation substitution, numeric entry, multi-step derivations, and explicit backprop calculations.

## Phase 5 — From sequences to attention

- [ ] Why sequence order matters
- [ ] The limits of fixed-size context summaries
- [ ] Queries, keys, and values
- [ ] Attention scores
- [ ] Softmax
- [ ] Self-attention
- [ ] Causal masking
- [ ] Multi-head attention

**Interaction target:** build score tables, trace dependencies, calculate softmax/weighted sums, manipulate masks, and inspect attention matrices.

## Phase 6 — Build the Transformer

- [ ] Positional information
- [ ] Transformer blocks
- [ ] Feed-forward / MLP layers
- [ ] Residual connections
- [ ] Normalization
- [ ] Build a tiny decoder-only transformer
- [ ] Train it end-to-end

**Interaction target:** assemble components, inspect tensor shapes, complete small code paths, trace values through a block, and eventually run a working model.

## Phase 7 — From model to real system

- [ ] Next-token prediction
- [ ] Cross-entropy loss
- [ ] Sampling and temperature
- [ ] Context windows
- [ ] KV cache
- [ ] Batching
- [ ] Quantization
- [ ] Fine-tuning
- [ ] Distributed training
- [ ] Inference and serving

**Interaction target:** experiment with real inference knobs, inspect memory/latency tradeoffs, manipulate batches/caches, and connect model mathematics to serving systems.

## Interaction R&D checkpoints

These are format stress tests, not learner prerequisites.

- [x] Continuous-math prototype — gradient descent: live parameter scrubber, loss curve, learner-chosen measurements, and a multi-step numeric derivation (`/labs/gradient-descent`)
- [ ] Symbolic prototype — rearranging an expression, not evaluating a given one. The gradient lab derives numerically; it does not test symbolic manipulation.
- [ ] Attention prototype — construct and inspect a small attention matrix
- [ ] Code/build prototype — complete a tiny differentiable component and observe its output

A phase should not standardize an interaction pattern until at least one real prototype demonstrates that the format can carry the concept without collapsing into multiple-choice recognition.
