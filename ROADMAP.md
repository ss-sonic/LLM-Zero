# LLM Zero Roadmap

LLM Zero grows from the smallest representation concepts toward complete language-model systems. The sequence is intentionally bottom-up; later modules should not assume ideas that have not yet been earned by earlier lessons.

## Phase 1 — Text becomes data

- [x] Lesson 01 — How can the letter A exist inside a computer?
- [x] Lesson 02 — Why do computers need a shared character table?
- [ ] Lesson 03 — ASCII: one early shared agreement
- [ ] Lesson 04 — Break ASCII with the world's languages
- [ ] Lesson 05 — Unicode and code points
- [ ] Lesson 06 — A code point is not a byte
- [ ] Lesson 07 — Build UTF-8 by hand
- [ ] Lesson 08 — UTF-8 vs UTF-16 vs UTF-32
- [ ] Challenge — Trace a multilingual sentence from symbols to bytes

## Phase 2 — Text becomes model input

- [ ] Why not feed raw characters directly?
- [ ] What is a token?
- [ ] Build a tiny word tokenizer
- [ ] Discover out-of-vocabulary problems
- [ ] Build byte-pair encoding from scratch
- [ ] Compare character, word, byte, and subword approaches
- [ ] Vocabulary size and sequence-length trade-offs
- [ ] Token IDs are identifiers, not meaning

## Phase 3 — Numbers acquire learnable geometry

- [ ] Vectors from first principles
- [ ] Coordinates and dimensions
- [ ] Dot products
- [ ] Matrices and matrix multiplication
- [ ] From token IDs to embeddings
- [ ] Similarity and learned representation

## Phase 4 — A tiny neural network learns

- [ ] Functions, parameters, and predictions
- [ ] Measuring error
- [ ] Derivatives and gradients
- [ ] Gradient descent
- [ ] Chain rule
- [ ] Backpropagation by hand
- [ ] Build and train a tiny network without hiding the math

## Phase 5 — From sequences to attention

- [ ] Why sequence order matters
- [ ] The limits of fixed-size context summaries
- [ ] Queries, keys, and values
- [ ] Attention scores
- [ ] Softmax
- [ ] Self-attention
- [ ] Causal masking
- [ ] Multi-head attention

## Phase 6 — Build the Transformer

- [ ] Positional information
- [ ] Transformer blocks
- [ ] Feed-forward / MLP layers
- [ ] Residual connections
- [ ] Normalization
- [ ] Build a tiny decoder-only transformer
- [ ] Train it end-to-end

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
