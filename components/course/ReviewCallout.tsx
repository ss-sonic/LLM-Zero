"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { REVIEW_PROMPT_IDS } from "../../curriculum/review";
import {
  completedLessonSlugs,
  duePromptIds,
  eligiblePrompts,
  ensureScheduled,
  nextDueAt,
  readSchedule,
  writeSchedule,
} from "../../lib/course/review";

/**
 * The course map's entry point into spaced review.
 *
 * It stays out of the way until a learner has actually finished something, and
 * says plainly when the next idea is coming back rather than nagging.
 */
export function ReviewCallout() {
  const [state, setState] = useState<{ due: number; total: number; nextDue: number | null } | null>(null);

  useEffect(() => {
    const now = Date.now();
    const completed = completedLessonSlugs();
    const ids = eligiblePrompts((slug) => completed.has(slug)).map((prompt) => prompt.id);
    if (ids.length === 0) {
      setState({ due: 0, total: 0, nextDue: null });
      return;
    }

    const stored = readSchedule(REVIEW_PROMPT_IDS);
    const seeded = ensureScheduled(stored, ids, now);
    if (seeded !== stored) writeSchedule(seeded);

    setState({ due: duePromptIds(seeded, ids, now).length, total: ids.length, nextDue: nextDueAt(seeded, ids) });
  }, []);

  if (!state || state.total === 0) return null;

  const waiting = state.due === 0;
  const days = state.nextDue === null ? null : Math.ceil((state.nextDue - Date.now()) / (24 * 60 * 60 * 1000));

  return (
    <section className={`review-callout${waiting ? " waiting" : ""}`} aria-label="Spaced review">
      <div>
        <small>Spaced review</small>
        <b>{waiting
          ? `${state.total} ${state.total === 1 ? "idea is" : "ideas are"} resting`
          : `${state.due} ${state.due === 1 ? "idea is" : "ideas are"} ready to come back`}</b>
        <p>{waiting
          ? days !== null && days > 0
            ? `Nothing is due today. The next one returns in ${days === 1 ? "a day" : `${days} days`}.`
            : "Nothing is due today."
          : "Retrieving an idea after you have started to forget it is what makes it stick. It takes a couple of minutes."}</p>
      </div>
      {!waiting && <Link className="primary-button" href="/review">Start review →</Link>}
    </section>
  );
}
