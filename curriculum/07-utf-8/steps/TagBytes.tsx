"use client";

import { Feedback } from "../../../components/ui/Feedback";
import { QuestionPrompt } from "../../../components/ui/QuestionPrompt";
import { CONTINUATION_PREFIX, UTF8_FORMS } from "../utf8";

const MULTI_BYTE_FORMS = UTF8_FORMS.filter((form) => form.bytes > 1);

export function TagBytesStep({
  values,
  onChange,
  onContinue,
}: {
  values: string[];
  onChange: (index: number, value: string) => void;
  onContinue: () => void;
}) {
  const expected = MULTI_BYTE_FORMS.map((form) => form.leadPrefix);
  const filled = values.every((value) => value.trim() !== "");
  const matches = expected.map((prefix, index) => values[index].trim() === prefix);
  const solved = filled && matches.every(Boolean);

  return (
    <div className="screen-layout centered-screen wide-screen l7-screen">
      <QuestionPrompt
        eyebrow="Step 5 · Tag the bytes"
        title="Every multi-byte byte starts with 1. So how does a middle byte differ from a first one?"
        lead="If a first byte and a continuation byte looked the same, the receiver would be back to guessing. They need different openings."
      />

      <div className="card l7-tag-lab">
        <div className="l7-given">
          <code>{CONTINUATION_PREFIX}xxxxxx</code>
          <span>a continuation — never the start of anything, always the middle of a character already underway</span>
        </div>

        <p className="l7-rule">
          That leaves <code>11…</code> for first bytes. A first byte also has to say <b>how many</b> bytes follow, and
          there is a compact way to write it: <b>as many 1s as the character has bytes, then a 0 to close the run.</b>
        </p>

        <div className="l7-tag-table">
          {MULTI_BYTE_FORMS.map((form, index) => (
            <label className="l7-tag-row" key={form.bytes}>
              <small>{form.bytes} bytes</small>
              <input
                className={`l7-input tag${matches[index] ? " right" : ""}${filled && !matches[index] ? " wrong" : ""}`}
                value={values[index]}
                onChange={(event) => onChange(index, event.target.value.replace(/[^01]/g, "").slice(0, 5))}
                aria-label={`Opening bits of the first byte of a ${form.bytes}-byte character`}
                placeholder="?"
              />
              <code>{(values[index].trim() || "…")}{"x".repeat(Math.max(0, 8 - (values[index].trim().length || 0)))}</code>
            </label>
          ))}
        </div>

        {filled && !solved && (
          <Feedback tone="nudge">
            Count in 1s, then stop with a 0. A two-byte character opens with two 1s and then a 0.
          </Feedback>
        )}
      </div>

      {solved && (
        <>
          <Feedback tone="success">
            <div>
              <b>A byte now announces its own role before it says anything else.</b>
              <span>The receiver reads the opening bits of one byte and knows whether a character starts there and how long it runs.</span>
            </div>
          </Feedback>

          <div className="l7-contrast" aria-label="Which parts of this design were forced and which were chosen">
            <div>
              <small>Forced</small>
              <b>0xxxxxxx for one byte</b>
              <span>Anything else would break every ASCII file that already exists.</span>
            </div>
            <div>
              <small>Forced</small>
              <b>10 for a middle, 11 for a start</b>
              <span>Without a difference the receiver cannot find a boundary, which is the problem we came here with.</span>
            </div>
            <div className="chosen">
              <small>Chosen</small>
              <b>The length as a run of 1s</b>
              <span>A small length field would also work. The run was picked because the count can be read straight off the first byte, and every continuation stays identical.</span>
            </div>
          </div>

          <button className="primary-button l7-main-action" onClick={onContinue}>Count what is left over →</button>
        </>
      )}
    </div>
  );
}
