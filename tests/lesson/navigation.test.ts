import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { readStepFromUrl, writeStepToUrl } from "../../lib/lesson/navigation";
import { clearBrowserStubs, installFakeLocation } from "../helpers/environment";

afterEach(clearBrowserStubs);

describe("readStepFromUrl", () => {
  it("reads the learner-facing 1-based step as a 0-based index", () => {
    installFakeLocation("https://llm-zero.test/lessons/ascii?step=3");
    assert.equal(readStepFromUrl(), 2);
  });

  it("returns null when no step is pinned, so saved progress decides", () => {
    installFakeLocation("https://llm-zero.test/lessons/ascii");
    assert.equal(readStepFromUrl(), null);
  });

  it("rejects values that are not whole steps, falling back to saved progress", () => {
    for (const raw of ["banana", "2.5", "", "%20", "NaN", "0", "-3"]) {
      installFakeLocation(`https://llm-zero.test/lessons/ascii?step=${raw}`);
      assert.equal(readStepFromUrl(), null, `expected ${raw} to be rejected`);
    }
  });

  it("passes through out-of-range requests for the progress guard to clamp", () => {
    installFakeLocation("https://llm-zero.test/lessons/ascii?step=999");
    assert.equal(readStepFromUrl(), 998);
  });
});

describe("writeStepToUrl", () => {
  it("writes a 1-based step and preserves the rest of the URL", () => {
    const fake = installFakeLocation("https://llm-zero.test/lessons/ascii?ref=home");
    writeStepToUrl(4, "push");
    assert.match(fake.current(), /step=5/);
    assert.match(fake.current(), /ref=home/);
  });

  it("pushes a history entry when navigating and replaces one when restoring", () => {
    const fake = installFakeLocation("https://llm-zero.test/lessons/ascii");
    writeStepToUrl(1, "push");
    writeStepToUrl(2, "replace");
    assert.deepEqual(fake.entries.map((entry) => entry.mode), ["push", "replace"]);
    assert.deepEqual(fake.entries.map((entry) => entry.state), [{ lessonStep: 1 }, { lessonStep: 2 }]);
  });

  it("round-trips with readStepFromUrl", () => {
    installFakeLocation("https://llm-zero.test/lessons/ascii");
    writeStepToUrl(6, "replace");
    assert.equal(readStepFromUrl(), 6);
  });
});
