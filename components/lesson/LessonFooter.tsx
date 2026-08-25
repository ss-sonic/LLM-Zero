"use client";

export function LessonFooter({
  currentStep,
  stepCount,
  onBack,
}: {
  currentStep: number;
  stepCount: number;
  onBack: () => void;
}) {
  return (
    <div className="stage-footer" aria-label="Lesson navigation">
      <button className="back-button" onClick={onBack} disabled={currentStep === 0}>← Back</button>
      <span>{currentStep + 1} / {stepCount}</span>
      <span className="footer-hint">Complete this screen to unlock the next one.</span>
    </div>
  );
}
