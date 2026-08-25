import type { LessonMeta } from "../../curriculum/types";
import { readPersistedLessonState } from "../lesson/persistence";

type SavedProgress = {
  currentStep?: number;
  highestUnlocked?: number;
};

export type CourseProgressState = "start" | "continue" | "completed";

export function getCourseProgressState(lesson: LessonMeta): CourseProgressState {
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
