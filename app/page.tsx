"use client";

import { useMemo, useState } from "react";

const PRESETS = [
  { symbol: "A", label: "Letter A" },
  { symbol: "B", label: "Letter B" },
  { symbol: "?", label: "Question mark" },
  { symbol: "♥", label: "Heart" },
];

function toBits(value: number) {
  return value.toString(2).padStart(8, "0").slice(-8).split("");
}

function bitsToNumber(bits: string[]) {
  return parseInt(bits.join(""), 2);
}

export default function Home() {
  const [symbol, setSymbol] = useState("A");
  const [agreedNumber, setAgreedNumber] = useState(65);
  const [bits, setBits] = useState(() => toBits(65));
  const [receiverMap, setReceiverMap] = useState(65);
  const [prediction, setPrediction] = useState<"same" | "different" | null>(null);
  const [revealed, setRevealed] = useState(false);

  const bitNumber = useMemo(() => bitsToNumber(bits), [bits]);
  const decoded = bitNumber === receiverMap ? symbol : "?";

  function chooseSymbol(next: string) {
    setSymbol(next);
    setPrediction(null);
    setRevealed(false);
  }

  function updateNumber(next: number) {
    const safe = Math.max(0, Math.min(255, Number.isFinite(next) ? next : 0));
    setAgreedNumber(safe);
    setBits(toBits(safe));
    setReceiverMap(safe);
    setPrediction(null);
    setRevealed(false);
  }

  function flipBit(index: number) {
    setBits((current) => current.map((bit, i) => (i === index ? (bit === "0" ? "1" : "0") : bit)));
    setPrediction(null);
    setRevealed(false);
  }

  function resetByte() {
    setBits(toBits(agreedNumber));
    setReceiverMap(agreedNumber);
    setPrediction(null);
    setRevealed(false);
  }

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="LLM Zero home">
          <span className="brand-mark">0</span>
          <span>LLM Zero</span>
        </a>
        <div className="header-meta">
          <span className="open-badge">Open source</span>
          <a href="https://github.com/ss-sonic/LLM-Zero">GitHub ↗</a>
        </div>
      </header>

      <section className="hero" id="top">
        <p className="eyebrow">Lesson 01 · Text representation</p>
        <h1>How can the letter <span className="hero-a">A</span> exist inside a computer?</h1>
        <p className="hero-copy">
          You see letters. A computer stores electrical states that we describe with numbers.
          Let&apos;s build the bridge between those two worlds ourselves.
        </p>
        <a className="start-button" href="#experiment">Start the experiment ↓</a>
      </section>

      <section className="idea-strip" aria-label="Lesson path">
        <div><b>1</b><span>Pick a symbol</span></div>
        <span className="path-arrow">→</span>
        <div><b>2</b><span>Agree on a number</span></div>
        <span className="path-arrow">→</span>
        <div><b>3</b><span>Store that number as bits</span></div>
        <span className="path-arrow">→</span>
        <div><b>4</b><span>Decode it again</span></div>
      </section>

      <section className="lesson" id="experiment">
        <div className="lesson-heading">
          <p className="step-label">Step 1</p>
          <h2>First, choose something humans can see.</h2>
          <p>A symbol is useful to us. But by itself, it gives the computer no rule for what to store.</p>
        </div>

        <div className="symbol-picker card">
          <div className="giant-symbol" aria-live="polite">{symbol}</div>
          <div>
            <p className="small-label">Choose a symbol</p>
            <div className="preset-row">
              {PRESETS.map((item) => (
                <button
                  className={symbol === item.symbol ? "preset active" : "preset"}
                  key={item.symbol}
                  onClick={() => chooseSymbol(item.symbol)}
                  aria-label={item.label}
                >
                  {item.symbol}
                </button>
              ))}
            </div>
            <label className="custom-symbol">
              Or type one character
              <input
                value={symbol}
                maxLength={2}
                onChange={(event) => chooseSymbol(Array.from(event.target.value)[0] ?? "A")}
                aria-label="Custom symbol"
              />
            </label>
          </div>
        </div>
      </section>

      <section className="lesson">
        <div className="lesson-heading">
          <p className="step-label">Step 2</p>
          <h2>Now invent a rule.</h2>
          <p>
            We can decide that <strong>{symbol}</strong> will be represented by a number. The exact number is not magic.
            What matters is that everyone who communicates agrees on the same rule.
          </p>
        </div>

        <div className="mapping-card card">
          <div className="mapping-side">
            <span className="mapping-caption">Human symbol</span>
            <span className="mapping-symbol">{symbol}</span>
          </div>
          <span className="mapping-arrow">→</span>
          <div className="mapping-side">
            <label className="mapping-caption" htmlFor="number-choice">Our agreed number</label>
            <input
              id="number-choice"
              className="number-input"
              type="number"
              min="0"
              max="255"
              value={agreedNumber}
              onChange={(event) => updateNumber(Number(event.target.value))}
            />
          </div>
        </div>

        <aside className="think-box">
          <span>Think about it</span>
          <p>
            Could we have chosen <b>42</b> for {symbol}? Yes. Could we choose <b>201</b>? Also yes.
            A mapping becomes useful when two systems agree to use it.
          </p>
        </aside>
      </section>

      <section className="lesson dark-lesson">
        <div className="lesson-heading">
          <p className="step-label">Step 3</p>
          <h2>A number can be written using only 0 and 1.</h2>
          <p>
            Here we&apos;ll use eight positions — one <strong>byte</strong>. Each position represents a power of two.
            Click any bit to flip it and watch the stored number change.
          </p>
        </div>

        <div className="bit-lab card dark-card">
          <div className="bit-values" aria-hidden="true">
            {[128, 64, 32, 16, 8, 4, 2, 1].map((value) => <span key={value}>{value}</span>)}
          </div>
          <div className="bits" aria-label={`Binary value ${bits.join("")}`}>
            {bits.map((bit, index) => (
              <button key={index} onClick={() => flipBit(index)} className={bit === "1" ? "bit on" : "bit"}>
                {bit}
              </button>
            ))}
          </div>
          <div className="equation">
            <span>{bits.join("")}</span>
            <b>=</b>
            <strong>{bitNumber}</strong>
          </div>
          {bitNumber !== agreedNumber && (
            <p className="changed-note">You changed the byte. It no longer stores our agreed number {agreedNumber}.</p>
          )}
          <button className="text-button" onClick={resetByte}>Reset to {symbol} → {agreedNumber}</button>
        </div>
      </section>

      <section className="lesson">
        <div className="lesson-heading">
          <p className="step-label">Step 4</p>
          <h2>Can another computer read it?</h2>
          <p>
            Imagine Computer 1 sends only the bits. Computer 2 needs the same mapping table to turn the number back into the symbol you meant.
          </p>
        </div>

        <div className="computers">
          <div className="computer card">
            <span className="computer-title">Computer 1 · sender</span>
            <div className="screen">
              <span className="screen-symbol">{symbol}</span>
              <span>→ {agreedNumber}</span>
              <code>{toBits(agreedNumber).join("")}</code>
            </div>
          </div>
          <div className="wire"><span>{toBits(agreedNumber).join("")}</span>→</div>
          <div className="computer card">
            <span className="computer-title">Computer 2 · receiver</span>
            <label className="receiver-label">
              In my table, {symbol} equals
              <input
                type="number"
                min="0"
                max="255"
                value={receiverMap}
                onChange={(event) => {
                  const next = Math.max(0, Math.min(255, Number(event.target.value) || 0));
                  setReceiverMap(next);
                  setRevealed(false);
                }}
              />
            </label>
          </div>
        </div>

        <div className="prediction card">
          <p>Before revealing the result: if the receiver uses a different mapping, will it recover the same symbol?</p>
          <div className="prediction-actions">
            <button className={prediction === "same" ? "choice selected" : "choice"} onClick={() => setPrediction("same")}>Yes, same symbol</button>
            <button className={prediction === "different" ? "choice selected" : "choice"} onClick={() => setPrediction("different")}>No, something breaks</button>
            <button className="reveal" disabled={!prediction} onClick={() => setRevealed(true)}>Reveal</button>
          </div>
          {revealed && (
            <div className={receiverMap === agreedNumber ? "result correct" : "result mismatch"}>
              <b>{receiverMap === agreedNumber ? "The rule matches." : "The rules disagree."}</b>
              <span>
                The sender transmitted {toBits(agreedNumber).join("")} = {agreedNumber}. The receiver&apos;s table says {symbol} = {receiverMap}.
                {receiverMap === agreedNumber ? ` So it can recover ${symbol}.` : " So it cannot know that those bits were meant to represent your symbol."}
              </span>
            </div>
          )}
        </div>
      </section>

      <section className="lesson takeaway">
        <p className="step-label">What you discovered</p>
        <h2>The number does not contain the meaning.</h2>
        <p className="takeaway-copy">
          We gave a human symbol an agreed numeric identifier, then stored that number with bits. The number itself does not "understand" {symbol}.
          It works because systems share a convention for interpreting it.
        </p>
        <div className="pipeline" aria-label="Representation pipeline">
          <div><small>Human sees</small><b>{symbol}</b></div>
          <span>→</span>
          <div><small>We agree on</small><b>{agreedNumber}</b></div>
          <span>→</span>
          <div><small>Computer stores</small><b className="binary-small">{toBits(agreedNumber).join("")}</b></div>
        </div>
        <div className="next-card">
          <div>
            <small>Next question</small>
            <h3>What if every computer invents its own table?</h3>
            <p>That problem leads us to shared character standards — and eventually ASCII.</p>
          </div>
          <span className="locked">Lesson 02 · coming next</span>
        </div>
      </section>

      <footer>
        <div><b>LLM Zero</b><span>Built in public, for everyone.</span></div>
        <p>Open source · First principles · No black boxes</p>
      </footer>
    </main>
  );
}
