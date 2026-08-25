import type { ReactNode } from "react";

export function QuestionPrompt({
  eyebrow,
  title,
  lead,
  centered = true,
  compact = true,
  level = "h2",
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  centered?: boolean;
  compact?: boolean;
  level?: "h1" | "h2";
}) {
  const Heading = level;
  const className = [
    "screen-copy",
    centered ? "centered-copy" : "",
    compact ? "compact-copy" : "",
  ].filter(Boolean).join(" ");

  return (
    <div className={className}>
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <Heading>{title}</Heading>
      {lead ? <p className="lead">{lead}</p> : null}
    </div>
  );
}
