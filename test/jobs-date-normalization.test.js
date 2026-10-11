import test from "node:test";
import assert from "node:assert/strict";
import { normalizeDate, normalizeJob } from "../dist/jobs/normalize.js";

test("normalizes Unix epoch seconds into ISO timestamps", () => {
  assert.equal(normalizeDate("1791696787"), new Date(1791696787 * 1000).toISOString());
});

test("normalizes numeric provider dates before they reach the database", () => {
  const job = normalizeJob({
    source: "test",
    externalId: "timestamp-job",
    title: "Remote Data Annotator",
    description: "Data annotation",
    url: "https://example.com/jobs/1",
    postedAt: "1791696787"
  });
  assert.equal(job.postedAt, new Date(1791696787 * 1000).toISOString());
});

test("drops malformed provider dates instead of persisting invalid timestamps", () => {
  assert.equal(normalizeDate("not-a-date"), undefined);
});
