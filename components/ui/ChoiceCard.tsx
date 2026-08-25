"use client";

import type { ReactNode } from "react";

export function ChoiceCard({
  selected = false,
  variant = "compact",
  onClick,
  children,
}: {
  selected?: boolean;
  variant?: "compact" | "large";
  onClick: () => void;
  children: ReactNode;
}) {
  const baseClass = variant === "large" ? "big-choice" : "choice-card";

  return (
    <button className={`${baseClass}${selected ? " selected" : ""}`} onClick={onClick}>
      {children}
    </button>
  );
}
