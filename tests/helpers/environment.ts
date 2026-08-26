/**
 * Minimal browser stubs.
 *
 * The lesson mechanics under test are pure except for two browser surfaces —
 * the URL and local storage — so we stub exactly those rather than pulling in a
 * DOM implementation.
 */

type HistoryEntry = { state: unknown; url: string; mode: "push" | "replace" };

export function installFakeLocation(href: string) {
  const entries: HistoryEntry[] = [];
  const fakeWindow = {
    location: { href },
    history: {
      pushState(state: unknown, _title: string, url: string | URL) {
        fakeWindow.location.href = String(url);
        entries.push({ state, url: String(url), mode: "push" });
      },
      replaceState(state: unknown, _title: string, url: string | URL) {
        fakeWindow.location.href = String(url);
        entries.push({ state, url: String(url), mode: "replace" });
      },
    },
  };

  (globalThis as { window?: unknown }).window = fakeWindow;
  return { entries, current: () => fakeWindow.location.href };
}

export function installFakeStorage(options: { throwOnAccess?: boolean } = {}) {
  const store = new Map<string, string>();
  const localStorage = {
    getItem(key: string) {
      if (options.throwOnAccess) throw new Error("storage disabled");
      return store.has(key) ? store.get(key)! : null;
    },
    setItem(key: string, value: string) {
      if (options.throwOnAccess) throw new Error("storage disabled");
      store.set(key, value);
    },
    removeItem(key: string) {
      if (options.throwOnAccess) throw new Error("storage disabled");
      store.delete(key);
    },
  };

  (globalThis as { window?: unknown }).window = { localStorage };
  return store;
}

export function clearBrowserStubs() {
  delete (globalThis as { window?: unknown }).window;
}
