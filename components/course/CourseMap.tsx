"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LESSONS } from "../../curriculum/registry";
import type { LessonMeta } from "../../curriculum/types";
import { readPersistedLessonState } from "../../lib/lesson/persistence";

type SavedProgress = {
  currentStep?: number;
  highestUnlocked?: number;
};

type CourseProgressState = "start" | "continue" | "completed";

function getCourseProgressState(lesson: LessonMeta): CourseProgressState {
  if (!lesson.progress) return "start";

  const saved = readPersistedLessonState<SavedProgress>(lesson.progress.storageKey);
  if (!saved) return "start";

  const highestUnlocked = typeof saved.highestUnlocked === "number" ? saved.highestUnlocked : 0;
  const currentStep = typeof saved.currentStep === "number" ? saved.currentStep : 0;
  const finalStep = lesson.progress.stepCount - 1;

  if (highestUnlocked >= finalStep) return "completed";
  if (highestUnlocked > 0 || currentStep > 0) return "continue";
  return "start";
}

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
            <span className="lesson-number">{String(lesson.number).padStart(2, "0")}</span>
            <div className="lesson-copy">
              <h3>{lesson.title}</h3>
              <p>{lesson.question}</p>
            </div>
            <span className={`lesson-action ${progressState}`}>{lesson.status === "available" ? actionLabel(progressState) : "Locked"}</span>
          </>
        );

        return lesson.status === "available" ? (
          <Link className={`lesson-row available ${progressState}`} href={`/lessons/${lesson.slug}`} key={lesson.slug}>
            {content}
          </Link>
        ) : (
          <div className="lesson-row locked" key={lesson.slug} aria-disabled="true">
            {content}
          </div>
        );
      })}
    </div>
  );
}
