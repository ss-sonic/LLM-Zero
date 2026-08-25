"use client";

import type { ReactNode } from "react";
import { Feedback } from "./Feedback";
import styles from "./TextRecall.module.css";

export type RecallAssessment = "matched" | "missed" | null;

const MIN_ANSWER_LENGTH = 12;

/**
 * Free-text retrieval.
 *
 * The learner commits an answer before seeing anything, then compares it against
 * the canonical principle and judges their own recall. We deliberately do not
 * machine-grade the prose: a keyword matcher rejects correct answers phrased in
 * unexpected words and accepts anything containing the expected words, which
 * teaches learners to guess vocabulary instead of retrieving the idea. The
 * retention benefit comes from committing before the reveal, not from scoring.
 */
export function TextRecall({
  label,
  value,
  placeholder,
  principle,
  committed,
  assessment,
  commitLabel = "Commit my answer →",
  onChange,
  onCommit,
  onAssess,
  onRewrite,
}: {
  label: string;
  value: string;
  placeholder?: string;
  principle: ReactNode;
  committed: boolean;
  assessment: RecallAssessment;
  commitLabel?: string;
  onChange: (value: string) => void;
  onCommit: () => void;
  onAssess: (assessment: Exclude<RecallAssessment, null>) => void;
  onRewrite: () => void;
}) {
  const longEnough = value.trim().length >= MIN_ANSWER_LENGTH;

  if (!committed) {
    return (
      <div className={styles.recall}>
        <label className={styles.label}>
          <span>{label}</span>
          <textarea
            className={styles.input}
            value={value}
            placeholder={placeholder}
            onChange={(event) => onChange(event.target.value)}
          />
        </label>
        <div className={styles.actions}>
          <button className="primary-button" disabled={!longEnough} onClick={onCommit}>
            {commitLabel}
          </button>
          <small className={styles.hint}>
            {longEnough
              ? "Your answer is locked in before the principle is revealed."
              : "Write at least one full sentence."}
          </small>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.recall}>
      <div className={styles.comparison}>
        <div className={styles.column}>
          <small>What you wrote</small>
          <p className={styles.written}>{value}</p>
        </div>
        <div className={`${styles.column} ${styles.principleColumn}`}>
          <small>The principle</small>
          <p className={styles.written}>{principle}</p>
        </div>
      </div>

      {assessment === null ? (
        <div className={styles.assessBlock}>
          <p className={styles.assessQuestion}>Did your answer carry that idea?</p>
          <div className={styles.assessActions}>
            <button className="primary-button" onClick={() => onAssess("matched")}>
              Yes — I had it
            </button>
            <button className="secondary-button" onClick={() => onAssess("missed")}>
              No — I missed it
            </button>
          </div>
          <small className={styles.hint}>Answer honestly. Nothing is scored, and either answer moves you on.</small>
        </div>
      ) : null}

      {assessment === "matched" ? (
        <Feedback tone="success">
          <div className={styles.feedbackCopy}>
            <b>You retrieved it.</b>
            <span>Recalling an idea without being shown it is what makes it stick.</span>
          </div>
        </Feedback>
      ) : null}

      {assessment === "missed" ? (
        <Feedback tone="nudge">
          <div className={styles.feedbackCopy}>
            <b>Noticing the gap is the useful part.</b>
            <span>Reading the principle right after trying to produce it beats never having tried.</span>
          </div>
        </Feedback>
      ) : null}

      {assessment !== null ? (
        <div className={styles.actions}>
          <button className="text-link-button" onClick={onRewrite}>
            Write it again in your own words
          </button>
        </div>
      ) : null}
    </div>
  );
}
