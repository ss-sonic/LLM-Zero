export type HistoryMode = "push" | "replace";

/**
 * Reads the learner-facing 1-based `?step=` as a 0-based index.
 *
 * Anything that is not a whole step from 1 upwards is treated as "not pinned",
 * so saved progress decides instead. An empty or zero value must not silently
 * resolve to screen 1 and throw away where the learner actually was — the URL
 * says where you are, and when it says nothing, persisted progress answers.
 */
export function readStepFromUrl() {
  const raw = new URL(window.location.href).searchParams.get("step");
  if (raw === null || raw.trim() === "") return null;

  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed < 1) return null;

  return parsed - 1;
}

export function writeStepToUrl(step: number, mode: HistoryMode) {
  const url = new URL(window.location.href);
  url.searchParams.set("step", String(step + 1));

  if (mode === "push") {
    window.history.pushState({ lessonStep: step }, "", url);
  } else {
    window.history.replaceState({ lessonStep: step }, "", url);
  }
}
