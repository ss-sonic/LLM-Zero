"use client";

export function LessonHeader({ onRestart }: { onRestart: () => void }) {
  return (
    <header className="site-header">
      <button className="brand brand-button" onClick={onRestart} aria-label="Restart this LLM Zero lesson">
        <span className="brand-mark">0</span>
        <span>LLM Zero</span>
      </button>
      <div className="header-meta">
        <a href="/">Course map</a>
        <span className="open-badge">Open source</span>
        <a href="https://github.com/ss-sonic/LLM-Zero" target="_blank" rel="noreferrer">GitHub ↗</a>
      </div>
    </header>
  );
}
