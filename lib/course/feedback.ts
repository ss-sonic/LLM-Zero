export const REPOSITORY_URL = "https://github.com/ss-sonic/LLM-Zero";

const TEMPLATE = "lesson-feedback.yml";

/**
 * Builds a pre-filled issue link for the screen the learner is looking at.
 *
 * The project has no way of knowing which explanations actually land: every
 * lesson is designed by principle and reviewed by principle, and nothing in the
 * loop can tell an author that a screen confuses people. This is the smallest
 * honest fix — the learner reports it themselves, in public, with the screen
 * already identified so they only have to describe the confusion.
 *
 * Deliberately not analytics. Nothing is collected, sent, or stored; the link
 * simply opens GitHub with the context filled in, and the learner decides.
 */
export function lessonFeedbackUrl({
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
  const screen = `${lessonTitle} — screen ${stepNumber} of ${stepCount}: ${stepLabel}`;
  const params = new URLSearchParams({
    template: TEMPLATE,
    labels: "learner-feedback",
    title: `Unclear: ${lessonTitle} — ${stepLabel}`,
    screen,
    url: `/lessons/${lessonSlug}?step=${stepNumber}`,
  });

  return `${REPOSITORY_URL}/issues/new?${params.toString()}`;
}
