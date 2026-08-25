import Link from "next/link";
import { LESSONS } from "../curriculum/registry";

export default function HomePage() {
  return (
    <main className="home-shell">
      <header className="home-header">
        <div className="brand">
          <span className="brand-mark">0</span>
          <span>LLM Zero</span>
        </div>
        <nav>
          <span className="open-badge">Open source</span>
          <a href="https://github.com/ss-sonic/LLM-Zero" target="_blank" rel="noreferrer">GitHub ↗</a>
        </nav>
      </header>

      <div className="home-main">
        <section className="home-hero">
          <p className="eyebrow">Learn from zero</p>
          <h1>Understand LLMs by building every idea from first principles.</h1>
          <p>No hidden prerequisites. No magic boxes. One small problem, experiment, and mental model at a time.</p>
        </section>

        <section className="course-section">
          <div className="course-heading">
            <div>
              <small>Module 01</small>
              <h2>Text becomes data</h2>
            </div>
            <p>Before an AI model can process language, a computer needs a precise way to represent text at all.</p>
          </div>

          <div className="lesson-list">
            {LESSONS.map((lesson) => {
              const content = (
                <>
                  <span className="lesson-number">{String(lesson.number).padStart(2, "0")}</span>
                  <div className="lesson-copy">
                    <h3>{lesson.title}</h3>
                    <p>{lesson.question}</p>
                  </div>
                  <span className="lesson-action">{lesson.status === "available" ? "Start →" : "Locked"}</span>
                </>
              );

              return lesson.status === "available" ? (
                <Link className="lesson-row available" href={`/lessons/${lesson.slug}`} key={lesson.slug}>
                  {content}
                </Link>
              ) : (
                <div className="lesson-row locked" key={lesson.slug} aria-disabled="true">
                  {content}
                </div>
              );
            })}
          </div>
        </section>

        <section className="home-principles" aria-label="How LLM Zero teaches">
          <article><b>Problem before solution</b><p>Feel why an idea had to be invented before learning its name.</p></article>
          <article><b>Interaction over memorization</b><p>Predict, manipulate, break, inspect, and rebuild instead of passively reading.</p></article>
          <article><b>Simple language, precise truth</b><p>Accessible enough for a curious teenager without hiding the real mechanics.</p></article>
        </section>
      </div>
    </main>
  );
}
