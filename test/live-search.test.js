import test from "node:test";
import assert from "node:assert/strict";
import { defaultLiveSources } from "../dist/jobs/live-sources.js";

test("default live search has multiple independent sources", () => {
  const sources = defaultLiveSources();
  assert.ok(sources.length >= 5);
  assert.equal(new Set(sources.map((source) => source.id)).size, sources.length);
  assert.ok(sources.some((source) => source.scope === "remote"));
  assert.ok(sources.some((source) => source.scope === "global"));
});
