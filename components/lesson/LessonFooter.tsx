"use client";

import { LessonFeedback } from "./LessonFeedback";

export function LessonFooter({
  currentStep,
  stepCount,
  stepLabel,
  lessonSlug,
  lessonTitle,
  onBack,
}: {
  currentStep: number;
  stepCount: number;
  stepLabel: string;
  lessonSlug?: string;
  lessonTitle: string;
  onBack: () => void;
}) {
  return (
    <div className="stage-footer" aria-label="Lesson navigation">
      <button className="back-button" onClick={onBack} disabled={currentStep === 0}>← Back</button>
      <span>{currentStep + 1} / {stepCount}</span>
      <div className="footer-meta">
        <span className="footer-hint">Complete this screen to unlock the next one.</span>
        {lessonSlug && (
          <LessonFeedback
            lessonSlug={lessonSlug}
            lessonTitle={lessonTitle}
            stepNumber={currentStep + 1}
            stepCount={stepCount}
            stepLabel={stepLabel}
          />
        )}
      </div>
    </div>
  );
}
