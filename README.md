# LLM Zero

**Learn large language models from first principles — one small idea at a time.**

LLM Zero is an open-source, public-good curriculum for understanding how language models work from the absolute bottom up. It is designed to be approachable enough for a curious 14-year-old while staying technically correct enough for engineers who want to reason from fundamentals.

The curriculum starts before tokenization. The first module asks a deceptively simple question:

> How can the letter `A` exist inside a computer?

From there we build upward: symbols → agreed numeric identifiers → bytes → bits → text encodings → tokenization → vectors → neural networks → attention → transformers → training → inference.

## Teaching principles

1. **Problem before solution.** First experience the limitation, then introduce the invention that solved it.
2. **One concept at a time.** No black-box jumps to higher abstractions.
3. **Interaction over memorization.** Learners predict, click, change, break, and inspect.
4. **Simple language, precise ideas.** Friendly explanations without sacrificing correctness.
5. **Public by default.** The project is open source and intended to remain freely useful to learners everywhere.

## First module: How Computers Represent Text

The first lesson is centered on the question **“How can the letter A exist inside a computer?”** It makes the learner move through the full representation chain:

`human symbol → agreed number → byte → bits`

Later lessons will introduce ASCII, break ASCII with global text, introduce Unicode and code points, then explore UTF-8 in depth. Tokenization is intentionally out of scope until this foundation is clear.

## Tech stack

- Next.js
- React
- TypeScript
- CSS (kept intentionally dependency-light at the beginning)

## Local development

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a pull request.

## License

MIT. See [LICENSE](./LICENSE).
