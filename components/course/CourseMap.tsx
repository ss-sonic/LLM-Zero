"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LESSONS } from "../../curriculum/registry";
import { getCourseProgressState, type CourseProgressState } from "../../lib/course/progress";

function actionLabel(state: CourseProgressState) {
  if (state === "completed") return "✓ Completed";
  if (state === "continue") return "Continue →";
  return "Start →";
}

export function CourseMap() {
  const [progressBySlug, setProgressBySlug] = useState<Record<string, CourseProgressState>>({});

  useEffect(() => {
    const nextProgress = Object.fromEntries(
      LESSONS.filter((lesson) => lesson.status === "available")
        .map((lesson) => [lesson.slug, getCourseProgressState(lesson)]),
    );
    setProgressBySlug(nextProgress);
  }, []);

  return (
    <div className="lesson-list">
      {LESSONS.map((lesson) => {
        const progressState = progressBySlug[lesson.slug] ?? "start";
        const content = (
          <>
            <span className="lesson-number">{lesson.displayNumber ?? String(lesson.number).padStart(2, "0")}</span>
            <div className="lesson-copy"><h3>{lesson.title}</h3><p>{lesson.question}</p></div>
            <span className={`lesson-action ${progressState}`}>{lesson.status === "available" ? actionLabel(progressState) : "Locked"}</span>
          </>
        );
        return lesson.status === "available" ? (
          <Link className={`lesson-row available ${progressState}`} href={`/lessons/${lesson.slug}`} key={lesson.slug}>{content}</Link>
        ) : (
          <div className="lesson-row locked" key={lesson.slug} aria-disabled="true">{content}</div>
        );
      })}
    </div>
  );
}
