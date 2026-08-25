export function lessonStorageKey(slug: string, version = 1) {
  return `llm-zero:lesson:${slug}:v${version}`;
}

export function readPersistedLessonState<T extends object>(key: string): Partial<T> | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed as Partial<T> : null;
  } catch {
    return null;
  }
}

export function writePersistedLessonState<T extends object>(key: string, state: T) {
  try {
    window.localStorage.setItem(key, JSON.stringify(state));
  } catch {
    // Lessons remain usable in privacy modes where local storage is unavailable.
  }
}

export function clearPersistedLessonState(key: string) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // In-memory state can still be reset when storage is unavailable.
  }
}
