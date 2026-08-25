import type { ReactNode } from "react";

const toneClasses = {
  nudge: "nudge",
  success: "success-feedback",
  mismatch: "mismatch-feedback",
} as const;

export function Feedback({
  tone,
  children,
}: {
  tone: keyof typeof toneClasses;
  children: ReactNode;
}) {
  return <div className={`feedback ${toneClasses[tone]}`}>{children}</div>;
}
