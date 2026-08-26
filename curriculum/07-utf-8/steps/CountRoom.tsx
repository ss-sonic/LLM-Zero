"use client";

import { Feedback } from "../../../components/ui/Feedback";
import { QuestionPrompt } from "../../../components/ui/QuestionPrompt";
import { MAX_CODE_POINT, UTF8_FORMS, totalPayloadBits } from "../utf8";

function notation(codePoint: number) {
  return `U+${codePoint.toString(16).toUpperCase().padStart(4, "0")}`;
}

export function CountRoomStep({
  values,
  onChange,
  onContinue,
}: {
  values: string[];
  onChange: (index: number, value: string) => void;
  onContinue: () => void;
}) {
  const expected = UTF8_FORMS.map(totalPayloadBits);
  const filled = values.every((value) => value.trim() !== "");
  const matches = expected.map((bits, index) => Number(values[index]) === bits);
  const solved = filled && matches.every(Boolean);

  return (
    <div className="screen-layout centered-screen wide-screen l7-screen">
      <QuestionPrompt
        eyebrow="Step 6 · Count the room"
        title="The tags are not free. How many bits are left for the number itself?"
        lead="Every tag bit is a bit the code point cannot use. Count what survives in each form."
      />

      <div className="card l7-room-lab">
        {UTF8_FORMS.map((form, index) => (
          <label className="l7-room-row" key={form.bytes}>
            <small>{form.bytes} {form.bytes === 1 ? "byte" : "bytes"}</small>
            <div className="l7-room-bytes">
              {Array.from({ length: form.bytes }, (_, byteIndex) => {
                const tag = byteIndex === 0 ? form.leadPrefix : "10";
                return (
                  <code key={byteIndex}>
                    <span className="l7-tagbits">{tag}</span>
                    {"x".repeat(8 - tag.length)}
                  </code>
                );
              })}
            </div>
            <input
              className={`l7-input small${matches[index] ? " right" : ""}${filled && !matches[index] ? " wrong" : ""}`}
              type="number"
              min={1}
              max={32}
              value={values[index]}
              onChange={(event) => onChange(index, event.target.value)}
              aria-label={`Free bits in the ${form.bytes}-byte form`}
              placeholder="?"
            />
            <small>free bits</small>
          </label>
        ))}

        {filled && !solved && (
          <Feedback tone="nudge">
            Count the x marks. Each byte has eight bits, and the tag at its front takes some of them.
          </Feedback>
        )}
      </div>

      {solved && (
        <>
          <Feedback tone="success">
            <div>
              <b>7, 11, 16 and 21 bits.</b>
              <span>Each form covers everything the shorter ones cannot, so every code point has exactly one size that fits it.</span>
            </div>
          </Feedback>

          <div className="l7-bands" aria-label="Which code points each form covers">
            {UTF8_FORMS.map((form) => (
              <div key={form.bytes}>
                <small>{form.bytes} {form.bytes === 1 ? "byte" : "bytes"} · {totalPayloadBits(form)} bits</small>
                <code>{notation(form.min)} – {notation(form.max)}</code>
                <span>{form.min.toLocaleString("en-US")} – {form.max.toLocaleString("en-US")}</span>
              </div>
            ))}
          </div>

          <p className="l7-ceiling">
            Twenty-one bits could hold {(2 ** 21).toLocaleString("en-US")} values, and Unicode&apos;s highest code point
            is {notation(MAX_CODE_POINT)} — {MAX_CODE_POINT.toLocaleString("en-US")}. Four bytes are more than enough.
            Why the ceiling sits at exactly that number has nothing to do with UTF-8, and everything to do with a
            different encoding. That is the next lesson.
          </p>

          <button className="primary-button l7-main-action" onClick={onContinue}>Build a real character →</button>
        </>
      )}
    </div>
  );
}
