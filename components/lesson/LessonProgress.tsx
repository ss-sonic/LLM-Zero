"use client";

import { canAccessStep } from "../../lib/lesson/progress";

export type LessonProgressProps = {
  lessonNumber: number;
  title: string;
  stepLabels: string[];
  currentStep: number;
  highestUnlocked: number;
  onNavigate: (step: number) => void;
};

export function LessonProgress({
  lessonNumber,
  title,
  stepLabels,
  currentStep,
  highestUnlocked,
  onNavigate,
}: LessonProgressProps) {
  return (
    <nav className="lesson-progress" aria-label="Lesson progress">
      <div className="progress-copy">
        <span>Lesson {String(lessonNumber).padStart(2, "0")}</span>
        <b>{title}</b>
      </div>
      <div className="progress-track">
        {stepLabels.map((label, index) => {
          const unlocked = canAccessStep(index, highestUnlocked);
          const complete = index < highestUnlocked;
          const current = index === currentStep;

          return (
            <div className="progress-item" key={label}>
              <button
                className={`progress-dot${current ? " current" : ""}${complete ? " complete" : ""}`}
                onClick={() => onNavigate(index)}
                disabled={!unlocked}
                aria-label={`${label}${unlocked ? "" : ", locked"}`}
                aria-current={current ? "step" : undefined}
                title={unlocked ? label : "Complete the previous step to unlock"}
              >
                {complete ? "✓" : unlocked ? index + 1 : "·"}
              </button>
              {index < stepLabels.length - 1 && (
                <span className={complete ? "progress-line filled" : "progress-line"} />
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
