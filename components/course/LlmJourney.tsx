"use client";

import { useEffect, useMemo, useState } from "react";
import { LESSONS } from "../../curriculum/registry";
import { getCourseProgressState, type CourseProgressState } from "../../lib/course/progress";

/**
 * Each stage maps to the curriculum module that builds it, so the "you are here"
 * marker follows the registry instead of being pinned to the first stage.
 * Modules with no registered lessons yet simply stay in the future.
 */
const PIPELINE = [
  { label: "Text", module: "Text becomes data", detail: "characters → code points → bytes" },
  { label: "Tokens", module: "Text becomes model input", detail: "bytes/text → token IDs" },
  { label: "Embeddings", module: "Numbers acquire learnable geometry", detail: "IDs → learned vectors" },
  { label: "Network", module: "A tiny neural network learns", detail: "vectors → learned transformations" },
  { label: "Attention", module: "From sequences to attention", detail: "tokens influence one another" },
  { label: "Transformer", module: "Build the Transformer", detail: "stack the full block" },
  { label: "Prediction", module: "From model to real system", detail: "next-token probabilities" },
] as const;

export function LlmJourney() {
  const [progressBySlug, setProgressBySlug] = useState<Record<string, CourseProgressState>>({});

  useEffect(() => {
    setProgressBySlug(Object.fromEntries(
      LESSONS.filter((lesson) => lesson.progress)
        .map((lesson) => [lesson.slug, getCourseProgressState(lesson)]),
    ));
  }, []);

  const { stages, currentIndex, currentStage, activeLesson } = useMemo(() => {
    const stages = PIPELINE.map((stage) => {
      const lessons = LESSONS.filter((lesson) => lesson.module === stage.module);
      const available = lessons.filter((lesson) => lesson.status === "available");
      const completed = available.filter((lesson) => progressBySlug[lesson.slug] === "completed");
      const built = lessons.length > 0;

      return {
        ...stage,
        available,
        lessons,
        completedCount: completed.length,
        // A module with lessons still to be written can never be finished, so the
        // marker stays put until its whole roadmap entry exists and is complete.
        finished: built
          && available.length === lessons.length
          && available.length > 0
          && completed.length === available.length,
      };
    });

    const firstUnfinished = stages.findIndex((stage) => stage.lessons.length > 0 && !stage.finished);
    const lastBuilt = stages.map((stage) => stage.lessons.length > 0).lastIndexOf(true);
    const currentIndex = firstUnfinished !== -1
      ? firstUnfinished
      : Math.min(Math.max(lastBuilt + 1, 0), stages.length - 1);

    const current = stages[currentIndex];
    const activeLesson = current.available.find((lesson) => progressBySlug[lesson.slug] !== "completed")
      ?? current.lessons.find((lesson) => lesson.status !== "available")
      ?? current.available[0]
      ?? null;

    return { stages, currentIndex, currentStage: current, activeLesson };
  }, [progressBySlug]);

  return (
    <section className="llm-journey" aria-label="Where this course is heading">
      <div className="journey-copy">
        <p className="eyebrow">The machine we are building</p>
        <h2><code>I&apos;m a boy 🚀</code> eventually becomes a next-token prediction.</h2>
        <p>Every lesson unlocks one link in that path. We are staying bottom-up, but you should always know which part of the eventual language model you are constructing.</p>
      </div>

      <div className="journey-pipeline" aria-label="LLM learning pipeline">
        {stages.map((stage, index) => {
          const state = index < currentIndex ? "done" : index === currentIndex ? "current" : "future";
          const caption = state === "done"
            ? "complete"
            : state === "future"
              ? "later"
              : stage.available.length > 0
                ? `${stage.completedCount} / ${stage.available.length} lessons`
                : "coming next";

          return (
            <div className={`journey-stage ${state}`} key={stage.label} aria-current={state === "current" ? "step" : undefined}>
              <small>{caption}</small>
              <b>{stage.label}</b>
              <span>{stage.detail}</span>
            </div>
          );
        })}
      </div>

      <div className="journey-now">
        <span>{activeLesson?.status === "available" ? "Building now" : "Next up"}</span>
        <b>{activeLesson?.title ?? `${currentStage.label} — lessons not written yet`}</b>
      </div>
    </section>
  );
}
