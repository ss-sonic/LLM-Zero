import { lessonFeedbackUrl } from "../../lib/course/feedback";

/**
 * Every screen carries its own way to say "this did not land".
 *
 * Kept quiet and constant rather than prompted, so it is available at the moment
 * of confusion without interrupting anyone who is not confused.
 */
export function LessonFeedback({
  lessonSlug,
  lessonTitle,
  stepNumber,
  stepCount,
  stepLabel,
}: {
  lessonSlug: string;
  lessonTitle: string;
  stepNumber: number;
  stepCount: number;
  stepLabel: string;
}) {
  return (
    <a
      className="feedback-link"
      href={lessonFeedbackUrl({ lessonSlug, lessonTitle, stepNumber, stepCount, stepLabel })}
      target="_blank"
      rel="noreferrer"
      title="Report an explanation that did not land on this screen"
    >
      Confusing? Tell us ↗
    </a>
  );
}
