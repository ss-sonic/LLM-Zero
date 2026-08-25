export type LessonStatus = "available" | "coming-soon";

export type LessonProgressMeta = {
  storageKey: string;
  stepCount: number;
};

export type LessonMeta = {
  number: number;
  displayNumber?: string;
  slug: string;
  title: string;
  question: string;
  description: string;
  module: string;
  status: LessonStatus;
  progress?: LessonProgressMeta;
};

export type LessonStepMeta = {
  id: string;
  label: string;
};
