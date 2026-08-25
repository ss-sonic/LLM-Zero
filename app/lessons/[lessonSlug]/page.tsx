import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CharacterRepresentationLesson } from "../../../curriculum/01-character-representation/lesson";
import { SharedCharacterTableLesson } from "../../../curriculum/02-shared-character-table/lesson";
import { AsciiLesson } from "../../../curriculum/03-ascii/lesson";
import { BreakingAsciiLesson } from "../../../curriculum/04-breaking-ascii/lesson";
import { UnicodeCodePointLesson } from "../../../curriculum/05-unicode-code-points/lesson";
import { CodePointsVsBytesLesson } from "../../../curriculum/06-code-points-vs-bytes/lesson";
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
    case "ascii":
      return <AsciiLesson />;
    case "breaking-ascii":
      return <BreakingAsciiLesson />;
    case "unicode":
      return <UnicodeCodePointLesson />;
    case "code-points-vs-bytes":
      return <CodePointsVsBytesLesson />;
    default:
      notFound();
  }
}
