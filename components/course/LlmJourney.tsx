"use client";

import { useEffect, useMemo, useState } from "react";
import { LESSONS } from "../../curriculum/registry";
import { getCourseProgressState, type CourseProgressState } from "../../lib/course/progress";

const PIPELINE = [
  { label: "Text", detail: "characters → code points → bytes" },
  { label: "Tokens", detail: "bytes/text → token IDs" },
  { label: "Embeddings", detail: "IDs → learned vectors" },
  { label: "Network", detail: "vectors → learned transformations" },
  { label: "Attention", detail: "tokens influence one another" },
  { label: "Transformer", detail: "stack the full block" },
  { label: "Prediction", detail: "next-token probabilities" },
] as const;

export function LlmJourney() {
  const [progressBySlug, setProgressBySlug] = useState<Record<string, CourseProgressState>>({});

  useEffect(() => {
    setProgressBySlug(Object.fromEntries(
      LESSONS.filter((lesson) => lesson.progress)
        .map((lesson) => [lesson.slug, getCourseProgressState(lesson)]),
    ));
  }, []);

  const phaseOne = LESSONS.filter((lesson) => lesson.module === "Text becomes data");
  const completed = phaseOne.filter((lesson) => progressBySlug[lesson.slug] === "completed").length;
  const activeLesson = useMemo(() => (
    phaseOne.find((lesson) => lesson.status === "available" && progressBySlug[lesson.slug] !== "completed")
      ?? phaseOne.find((lesson) => lesson.status !== "available")
  ), [phaseOne, progressBySlug]);

  return (
    <section className="llm-journey" aria-label="Where this course is heading">
      <div className="journey-copy">
        <p className="eyebrow">The machine we are building</p>
        <h2><code>I&apos;m a boy 🚀</code> eventually becomes a next-token prediction.</h2>
        <p>Every lesson unlocks one link in that path. We are staying bottom-up, but you should always know which part of the eventual language model you are constructing.</p>
      </div>

      <div className="journey-pipeline" aria-label="LLM learning pipeline">
        {PIPELINE.map((stage, index) => (
          <div className={`journey-stage${index === 0 ? " current" : " future"}`} key={stage.label}>
            <small>{index === 0 ? `${completed} / ${phaseOne.length} lessons` : "later"}</small>
            <b>{stage.label}</b>
            <span>{stage.detail}</span>
          </div>
        ))}
      </div>

      <div className="journey-now">
        <span>Building now</span>
        <b>{activeLesson?.title ?? "Text representation"}</b>
      </div>
    </section>
  );
}
