"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Feedback } from "../ui/Feedback";
import { TextRecall, type RecallAssessment } from "../ui/TextRecall";
import { REVIEW_PROMPT_IDS, getReviewPrompt, isConstructAnswerCorrect } from "../../curriculum/review";
import type { ReviewPrompt } from "../../curriculum/types";
import {
  completedLessonSlugs,
  duePromptIds,
  eligiblePrompts,
  ensureScheduled,
  nextDueAt,
  readSchedule,
  recordReview,
  writeSchedule,
  type ReviewSchedule,
} from "../../lib/course/review";

type Outcome = "remembered" | "missed";

function formatDue(timestamp: number, now: number) {
  const days = Math.ceil((timestamp - now) / (24 * 60 * 60 * 1000));
  if (days <= 0) return "today";
  if (days === 1) return "tomorrow";
  if (days < 7) return `in ${days} days`;
  const weeks = Math.round(days / 7);
  return weeks === 1 ? "in about a week" : `in about ${weeks} weeks`;
}

export function ReviewSession() {
  const [hasHydrated, setHasHydrated] = useState(false);
  const [schedule, setSchedule] = useState<ReviewSchedule>({});
  const [queue, setQueue] = useState<ReviewPrompt[]>([]);
  const [eligibleIds, setEligibleIds] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);

  const [entry, setEntry] = useState("");
  const [checked, setChecked] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [recallText, setRecallText] = useState("");
  const [committed, setCommitted] = useState(false);
  const [assessment, setAssessment] = useState<RecallAssessment>(null);
  const [graded, setGraded] = useState(false);

  useEffect(() => {
    const now = Date.now();
    const completed = completedLessonSlugs();
    const eligible = eligiblePrompts((slug) => completed.has(slug));
    const ids = eligible.map((prompt) => prompt.id);

    const stored = readSchedule(REVIEW_PROMPT_IDS);
    const seeded = ensureScheduled(stored, ids, now);
    if (seeded !== stored) writeSchedule(seeded);

    // The queue is fixed for the session: answering something must not reorder
    // what is still ahead of the learner.
    const due = duePromptIds(seeded, ids, now)
      .map(getReviewPrompt)
      .filter((prompt): prompt is ReviewPrompt => prompt !== undefined);

    setSchedule(seeded);
    setEligibleIds(ids);
    setQueue(due);
    setHasHydrated(true);
  }, []);

  const current = queue[index] ?? null;
  const finished = hasHydrated && queue.length > 0 && index >= queue.length;
  const rememberedCount = outcomes.filter((outcome) => outcome === "remembered").length;

  const nextDue = useMemo(() => nextDueAt(schedule, eligibleIds), [schedule, eligibleIds]);

  function grade(outcome: Outcome) {
    if (!current || graded) return;
    const updated = recordReview(schedule, current.id, outcome === "remembered", Date.now());
    setSchedule(updated);
    writeSchedule(updated);
    setOutcomes((current) => [...current, outcome]);
    setGraded(true);
  }

  function advance() {
    setIndex((current) => current + 1);
    setEntry("");
    setChecked(false);
    setRevealed(false);
    setRecallText("");
    setCommitted(false);
    setAssessment(null);
    setGraded(false);
  }

  if (!hasHydrated) return <main className="review-shell" aria-busy="true" />;

  if (eligibleIds.length === 0) {
    return (
      <ReviewFrame>
        <div className="review-empty card">
          <h1>Nothing to review yet.</h1>
          <p>Ideas start coming back a day after you finish the lesson that built them. Finish a lesson and this page fills itself.</p>
          <Link className="primary-button" href="/">Go to the course map</Link>
        </div>
      </ReviewFrame>
    );
  }

  if (queue.length === 0 || finished) {
    return (
      <ReviewFrame>
        <div className="review-empty card">
          <div className="completion-mark">✓</div>
          <h1>{queue.length === 0 ? "Nothing is due right now." : `${rememberedCount} of ${queue.length} came back.`}</h1>
          <p>
            {queue.length === 0
              ? "Everything you have finished is still inside its interval."
              : "Anything you missed will return sooner than the rest. Retrieving an idea after forgetting a little is what makes it stay."}
          </p>
          {nextDue !== null && <p className="review-next-due">Next review {formatDue(nextDue, Date.now())}.</p>}
          <Link className="primary-button" href="/">Back to the course map</Link>
        </div>
      </ReviewFrame>
    );
  }

  if (!current) return <main className="review-shell" aria-busy="true" />;

  const constructCorrect = current.kind === "construct" && isConstructAnswerCorrect(current, entry);
  const showConstructAnswer = revealed || (checked && constructCorrect);

  function checkAnswer() {
    if (entry.trim() === "" || showConstructAnswer) return;
    setChecked(true);
    if (constructCorrect) grade("remembered");
  }

  return (
    <ReviewFrame progress={`${index + 1} / ${queue.length}`}>
      <article className="review-card card">
        <p className="eyebrow">{current.source}</p>
        {current.context && <p className="review-context">{current.context}</p>}
        <h1 className="review-question">{current.question}</h1>

        {current.kind === "construct" ? (
          <>
            <div className="review-entry">
              <input
                value={entry}
                onChange={(event) => { setEntry(event.target.value); setChecked(false); }}
                placeholder="your answer"
                aria-label="Your answer"
                disabled={showConstructAnswer}
                onKeyDown={(event) => { if (event.key === "Enter") checkAnswer(); }}
              />
              {!showConstructAnswer && (
                <button className="primary-button" disabled={entry.trim() === ""} onClick={checkAnswer}>Check →</button>
              )}
            </div>

            {checked && !constructCorrect && !revealed && (
              <>
                <Feedback tone="nudge">Not quite. Try once more before looking — the effort is what the review is for.</Feedback>
                <button className="text-link-button" onClick={() => { setRevealed(true); grade("missed"); }}>Show me the answer</button>
              </>
            )}

            {showConstructAnswer && (
              <div className="review-answer">
                <div className="review-answer-row">
                  <small>{constructCorrect && !revealed ? "You had it" : "The answer"}</small>
                  <strong>{current.answer}</strong>
                </div>
                <p>{current.principle}</p>
              </div>
            )}
          </>
        ) : (
          <TextRecall
            label="Write it from memory, then compare."
            value={recallText}
            placeholder="One or two sentences."
            principle={current.principle}
            committed={committed}
            assessment={assessment}
            onChange={setRecallText}
            onCommit={() => setCommitted(true)}
            onAssess={(value) => { setAssessment(value); grade(value === "matched" ? "remembered" : "missed"); }}
            onRewrite={() => { setCommitted(false); setAssessment(null); }}
          />
        )}

        {graded && (
          <button className="primary-button review-advance" onClick={advance}>
            {index + 1 === queue.length ? "Finish review →" : "Next idea →"}
          </button>
        )}
      </article>
    </ReviewFrame>
  );
}

function ReviewFrame({ progress, children }: { progress?: string; children: React.ReactNode }) {
  return (
    <main className="review-shell">
      <header className="site-header">
        <Link className="brand" href="/">
          <span className="brand-mark">0</span>
          <span>LLM Zero</span>
        </Link>
        <div className="header-meta">
          <span className="review-kicker">Spaced review{progress ? ` · ${progress}` : ""}</span>
          <Link href="/">Course map</Link>
        </div>
      </header>
      <section className="review-stage">{children}</section>
    </main>
  );
}
