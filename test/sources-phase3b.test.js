import test from "node:test";
import assert from "node:assert/strict";
import { createJobicySource, createHimalayasSource, createBoqqsSource, parseJobPostingJsonLd } from "../dist/jobs/sources/index.js";

function mockFetch(payload, contentType = "application/json") {
  const original = globalThis.fetch;
  globalThis.fetch = async () => new Response(typeof payload === "string" ? payload : JSON.stringify(payload), { status: 200, headers: { "content-type": contentType } });
  return () => { globalThis.fetch = original; };
}
test("Jobicy maps remote jobs", async () => {
  const restore = mockFetch({ jobs: [{ id: "1", jobTitle: "Data Annotator", companyName: "Acme", jobDescription: "AI", url: "https://x", jobGeo: "Worldwide" }] });
  try { const jobs = await createJobicySource().search({}); assert.equal(jobs[0].title, "Data Annotator"); assert.equal(jobs[0].remote, true); } finally { restore(); }
});
test("Himalayas maps remote jobs", async () => {
  const restore = mockFetch({ jobs: [{ id: "1", title: "Software Engineer", companyName: "Acme", description: "TypeScript", applicationLink: "https://x" }] });
  try { const jobs = await createHimalayasSource().search({}); assert.equal(jobs[0].company, "Acme"); } finally { restore(); }
});
test("BOQQS maps Nigeria jobs", async () => {
  const restore = mockFetch({ jobs: [{ id: "1", title: "Developer", employer: "Acme", description: "API", city: "Port Harcourt", url: "https://x" }] });
  try { const jobs = await createBoqqsSource().search({ locations: ["Port Harcourt"] }); assert.equal(jobs[0].location, "Port Harcourt"); } finally { restore(); }
});
test("JSON-LD career parser extracts JobPosting", () => {
  const html = '<script type="application/ld+json">{"@context":"https://schema.org","@type":"JobPosting","title":"Backend Engineer","hiringOrganization":{"name":"Acme"},"description":"Build APIs","datePosted":"2026-10-01","url":"https://acme.test/jobs/1"}</script>';
  const jobs = parseJobPostingJsonLd(html, "https://acme.test/careers");
  assert.equal(jobs.length, 1); assert.equal(jobs[0].title, "Backend Engineer");
});
