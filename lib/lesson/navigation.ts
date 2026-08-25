export type HistoryMode = "push" | "replace";

export function readStepFromUrl() {
  const raw = new URL(window.location.href).searchParams.get("step");
  if (raw === null) return null;

  const parsed = Number(raw);
  if (!Number.isInteger(parsed)) return null;

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
