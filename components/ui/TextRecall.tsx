"use client";

import { Feedback } from "./Feedback";
import styles from "./TextRecall.module.css";

export function TextRecall({
  label,
  value,
  placeholder,
  status = "idle",
  nudge,
  success,
  submitLabel = "Check my explanation →",
  onChange,
  onSubmit,
}: {
  label: string;
  value: string;
  placeholder?: string;
  status?: "idle" | "needs-work" | "success";
  nudge?: string;
  success?: string;
  submitLabel?: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
}) {
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
        <button className="primary-button" disabled={value.trim().length < 3} onClick={() => onSubmit(value)}>
          {submitLabel}
        </button>
      </div>

      {status === "needs-work" && nudge ? (
        <Feedback tone="nudge"><div className={styles.feedbackCopy}><b>Try once more.</b><span>{nudge}</span></div></Feedback>
      ) : null}
      {status === "success" && success ? (
        <Feedback tone="success"><div className={styles.feedbackCopy}><b>That is the principle.</b><span>{success}</span></div></Feedback>
      ) : null}
    </div>
  );
}
