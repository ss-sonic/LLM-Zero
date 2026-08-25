"use client";

import type { ReactNode } from "react";
import { LessonFooter } from "./LessonFooter";
import { LessonHeader } from "./LessonHeader";
import { LessonProgress } from "./LessonProgress";
import { LessonStage } from "./LessonStage";

export type LessonPlayerProps = {
  lessonNumber?: number;
  /** Replaces the "Lesson NN" rail label, e.g. for interaction labs. */
  kicker?: string;
  title: string;
  stepLabels: string[];
  currentStep: number;
  highestUnlocked: number;
  darkStage?: boolean;
  onNavigate: (step: number) => void;
  onBack: () => void;
  onRestart: () => void;
  children: ReactNode;
};

export function LessonPlayer({
  lessonNumber,
  kicker,
  title,
  stepLabels,
  currentStep,
  highestUnlocked,
  darkStage = false,
  onNavigate,
  onBack,
  onRestart,
  children,
}: LessonPlayerProps) {
  return (
    <main className="app-shell">
      <LessonHeader onRestart={onRestart} />
      <LessonProgress
        lessonNumber={lessonNumber}
        kicker={kicker}
        title={title}
        stepLabels={stepLabels}
        currentStep={currentStep}
        highestUnlocked={highestUnlocked}
        onNavigate={onNavigate}
      />
      <LessonStage currentStep={currentStep} dark={darkStage}>
        {children}
      </LessonStage>
      <LessonFooter currentStep={currentStep} stepCount={stepLabels.length} onBack={onBack} />
    </main>
  );
}
