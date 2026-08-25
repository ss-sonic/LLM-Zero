import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CharacterRepresentationLesson } from "../../../curriculum/01-character-representation/lesson";
import { SharedCharacterTableLesson } from "../../../curriculum/02-shared-character-table/lesson";
import { LESSONS, getLessonMeta } from "../../../curriculum/registry";

export function generateStaticParams() {
  return LESSONS
    .filter((lesson) => lesson.status === "available")
    .map((lesson) => ({ lessonSlug: lesson.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lessonSlug: string }>;
}): Promise<Metadata> {
  const { lessonSlug } = await params;
  const lesson = getLessonMeta(lessonSlug);

  if (!lesson) return {};

  return {
    title: lesson.title,
    description: lesson.description,
  };
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ lessonSlug: string }>;
}) {
  const { lessonSlug } = await params;
  const lesson = getLessonMeta(lessonSlug);

  if (!lesson || lesson.status !== "available") notFound();

  switch (lessonSlug) {
    case "character-representation":
      return <CharacterRepresentationLesson />;
    case "shared-character-table":
      return <SharedCharacterTableLesson />;
    default:
      notFound();
  }
}
