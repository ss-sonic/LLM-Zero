"use client";

import { Feedback } from "../../../components/ui/Feedback";
import { QuestionPrompt } from "../../../components/ui/QuestionPrompt";
import {
  PIPELINE_ORDER,
  PIPELINE_STAGES,
  SCRAMBLED_STAGE_IDS,
  firstOutOfPlace,
  getStage,
  isPipelineComplete,
  type PipelineStageId,
} from "../pipeline";

/**
 * The composition check, and the reason this is a challenge rather than a review.
 *
 * Every lesson so far named the link the learner was working on. Knowing which
 * operation comes next when nobody says is a separate skill, and it has never
 * been tested. A wrong order is answered with the constraint that rules it out,
 * not with "try again".
 */
const NUDGES: Record<PipelineStageId, string> = {
  "symbol": "Start with the thing a human can point at. Everything else on this list is something a computer produces from it.",
  "code-point": "Nothing about storage can be decided yet. First the character needs an identity — the one number the world agreed on.",
  "form": "You cannot cut a number into bytes before deciding how many bytes it gets, and that decision is made by looking at the number.",
  "payload": "The tags go around something. The code point's bits have to be cut to fit the room first.",
  "bytes": "Tagging is the last thing that happens — it is what makes the finished bytes readable again from anywhere in the stream.",
};

export function LayOutPipelineStep({
  order,
  onPlace,
  onRemove,
  onClear,
  onContinue,
}: {
  order: string[];
  onPlace: (id: string) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  onContinue: () => void;
}) {
  const remaining = SCRAMBLED_STAGE_IDS.filter((id) => !order.includes(id));
  const full = order.length === PIPELINE_ORDER.length;
  const solved = isPipelineComplete(order);
  const mistake = full && !solved ? firstOutOfPlace(order) : -1;

  return (
    <div className="screen-layout centered-screen wide-screen c1-screen">
      <QuestionPrompt
        eyebrow="Step 2 · Lay out the pipeline"
        title={<>Before you touch the sentence: what happens to one character, in what order?</>}
        lead="Five stages, scrambled. Click them in the order they actually happen. Nobody is going to tell you which one you are on again."
      />

      <div className="card c1-pipeline">
        <ol className="c1-slots" aria-label="Your pipeline">
          {PIPELINE_ORDER.map((_, index) => {
            const placedId = order[index] as PipelineStageId | undefined;
            const wrong = mistake === index;
            return (
              <li className={`c1-slot${placedId ? " filled" : ""}${wrong ? " wrong" : ""}`} key={index}>
                <small>{index + 1}</small>
                {placedId ? (
                  <button
                    className="c1-slot-card"
                    onClick={() => onRemove(placedId)}
                    aria-label={`Remove ${getStage(placedId).label} from position ${index + 1}`}
                  >
                    <b>{getStage(placedId).label}</b>
                    <span>{getStage(placedId).detail}</span>
                    {solved && <em>{getStage(placedId).source}</em>}
                  </button>
                ) : (
                  <span className="c1-slot-empty">empty</span>
                )}
              </li>
            );
          })}
        </ol>

        {remaining.length > 0 && (
          <div className="c1-tray" aria-label="Stages still to place">
            {remaining.map((id) => (
              <button className="c1-tray-card" key={id} onClick={() => onPlace(id)}>
                <b>{getStage(id).label}</b>
                <span>{getStage(id).detail}</span>
              </button>
            ))}
          </div>
        )}

        {order.length > 0 && !solved && (
          <button className="text-link-button c1-clear" onClick={onClear}>Clear and start over</button>
        )}
      </div>

      {mistake !== -1 && (
        <Feedback tone="nudge">
          Position {mistake + 1} cannot be right. {NUDGES[PIPELINE_ORDER[mistake]]}
        </Feedback>
      )}

      {!full && (
        <p className="c1-hint">
          {PIPELINE_STAGES.length - order.length} still to place. Click a placed card to take it back out.
        </p>
      )}

      {solved && (
        <>
          <Feedback tone="success">
            <div className="c1-feedback-copy">
              <b>That is the whole of Module 01, in five moves.</b>
              <span>Each stage came from a different lesson, and none of them can swap with its neighbour without breaking the one after it.</span>
            </div>
          </Feedback>

          <p className="c1-turn">
            Notice what is <em>not</em> a stage: hexadecimal. <span className="inline-token">E4</span> and{" "}
            <span className="inline-token">11100100</span> are the same byte written two ways. Notation is how we talk about
            the result, not something that happens to the character.
          </p>

          <button className="primary-button c1-main-action" onClick={onContinue}>Start with the identities →</button>
        </>
      )}
    </div>
  );
}
