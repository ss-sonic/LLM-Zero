export type LessonStatus = "available" | "coming-soon";

export type LessonMeta = {
  number: number;
  slug: string;
  title: string;
  question: string;
  description: string;
  module: string;
  status: LessonStatus;
};

export type LessonStepMeta = {
  id: string;
  label: string;
};
