import test from "node:test";
import assert from "node:assert/strict";
import { createRemotiveSource, createRemoteJobsSource, createArbeitnowSource } from "../dist/jobs/sources/index.js";

function mockFetch(payload) {
  const original = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify(payload), { status: 200, headers: { "content-type": "application/json" } });
  return () => { globalThis.fetch = original; };
}
test("Remotive adapter maps API jobs", async () => {
  const restore = mockFetch({ jobs: [{ id: 1, title: "AI Evaluator", company_name: "Acme", description: "AI", url: "https://x", candidate_required_location: "Worldwide", publication_date: "2026-10-01" }] });
  try { const jobs = await createRemotiveSource().search({}); assert.equal(jobs[0].company, "Acme"); assert.equal(jobs[0].remote, true); } finally { restore(); }
});
test("RemoteJobs.org adapter maps nested company data", async () => {
  const restore = mockFetch({ data: [{ id: "a", title: "Data Annotator", company: { name: "Acme" }, description: "data", url: "https://x", location: "Worldwide" }] });
  try { const jobs = await createRemoteJobsSource().search({}); assert.equal(jobs[0].company, "Acme"); } finally { restore(); }
});
test("Arbeitnow adapter respects remote filtering", async () => {
  const restore = mockFetch({ data: [{ slug: "r", title: "Remote", company_name: "A", description: "AI", url: "https://x", location: "EU", remote: true }, { slug: "o", title: "Office", company_name: "B", description: "AI", url: "https://y", location: "Berlin", remote: false }] });
  try { const jobs = await createArbeitnowSource().search({ remoteOnly: true }); assert.equal(jobs.length, 1); } finally { restore(); }
});
