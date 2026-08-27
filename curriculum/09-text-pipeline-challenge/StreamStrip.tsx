"use client";

import { SENTENCE_CHARACTERS } from "./config";

/**
 * The artifact, carried across screens.
 *
 * Without it the challenge reads as eight separate questions about the same
 * sentence. With it there is one object on the table getting more complete, and
 * the learner can see which characters they have actually resolved — which is the
 * difference between a test and a job.
 */
export function StreamStrip({
  mode,
  solved,
  caption,
}: {
  mode: "identity" | "width" | "bytes";
  /** Which characters the learner has resolved so far; omitted means all of them. */
  solved?: boolean[];
  caption: string;
}) {
  const isSolved = (index: number) => solved?.[index] ?? true;
  const done = SENTENCE_CHARACTERS.filter((_, index) => isSolved(index)).length;

  return (
    <div className="c1-strip" aria-label={`${caption}: ${done} of ${SENTENCE_CHARACTERS.length} characters resolved`}>
      <small className="c1-strip-caption">{caption}</small>
      <div className="c1-strip-cells">
        {SENTENCE_CHARACTERS.map((character, index) => (
          <div className={`c1-cell${isSolved(index) ? " filled" : ""}`} key={index}>
            <strong className={character.symbol === " " ? "c1-space" : ""}>
              {character.symbol === " " ? "␣" : character.symbol}
            </strong>
            {mode === "identity" && <code>{isSolved(index) ? character.notation : "?"}</code>}
            {mode === "width" && <code>{isSolved(index) ? `${character.utf8Length}B` : "?"}</code>}
            {mode === "bytes" && (
              <code className="c1-cell-bytes">
                {isSolved(index) ? character.utf8Hex.join(" ") : "?"}
              </code>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
