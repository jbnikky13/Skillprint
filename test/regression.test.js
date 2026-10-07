import test from "node:test";
import assert from "node:assert/strict";
import { discoverJobsWithFailures } from "../dist/jobs/discovery.js";
import { createFingerprint } from "../dist/fingerprint/create.js";
import { evaluateAutopilot } from "../dist/agent/autopilot.js";
import { DEFAULT_AGENT_POLICY } from "../dist/agent/policy.js";
import { personalCandidate } from "../dist/profile/personal.js";

function raw(title, description = "Remote AI evaluator", source = "test") {
  return {
    title,
    description,
    url: "https://example.com/" + title.toLowerCase().replace(/\\s+/g, "-"),
    remote: true,
    source
  };
}

test("job discovery queries each source exactly once and preserves failures", async () => {
  let calls = 0;
  const sources = [
    { id: "ok", name: "OK", scope: "global", search: async () => { calls++; return [raw("AI evaluator")]; } },
    { id: "broken", name: "Broken", scope: "global", search: async () => { calls++; throw new Error("source offline"); } }
  ];
  const result = await discoverJobsWithFailures(sources, { keywords: ["AI"] });
  assert.equal(calls, 2);
  assert.equal(result.jobs.length, 1);
  assert.deepEqual(result.failures, [{ source: "broken", error: "Error: source offline" }]);
});

test("ranking stores the final score on the normalized job for policy checks", async () => {
  const job = {
    id: "job-1",
    title: "AI evaluator",
    description: "Remote AI evaluation",
    url: "https://example.com/job",
    remote: true,
    source: "test",
    discoveredAt: new Date().toISOString(),
    status: "active",
    fingerprint: createFingerprint({
      kind: "job",
      title: "AI evaluator",
      skills: ["AI evaluation"],
      roles: ["AI evaluator"],
      remoteEligible: true,
      remoteScope: "worldwide"
    })
  };
  const { rankOpportunities } = await import("../dist/ranking/rank.js");
  const ranked = await rankOpportunities(personalCandidate, [job]);
  assert.equal(typeof ranked[0].job.matchScore, "number");
  assert.equal(ranked[0].job.matchScore, ranked[0].finalScore);
});

test("autopilot reads the typed job match score without unsafe casts", () => {
  const job = {
    id: "job-1",
    title: "AI evaluator",
    description: "Remote AI evaluation",
    url: "https://example.com/job",
    remote: true,
    source: "test",
    discoveredAt: new Date().toISOString(),
    status: "active",
    matchScore: 40,
    fingerprint: createFingerprint({ kind: "job", title: "AI evaluator", remoteEligible: true, remoteScope: "worldwide" })
  };
  const task = {
    id: "task-1",
    job,
    package: {
      job,
      cv: { cvId: "ai-data", score: 100, reasons: [] },
      tailoredCV: { cvId: "ai-data", jobId: "job-1", headline: "", selectedSkills: [], selectedEvidence: [], changes: [] },
      coverLetter: { jobId: "job-1", cvId: "ai-data", content: "", claims: [] },
      answers: [],
      truthReport: { valid: true, unsupportedClaims: [], contradictions: [], warnings: [] }
    },
    mode: "manual",
    state: "ready",
    createdAt: new Date().toISOString(),
    attempts: 1
  };
  const decision = evaluateAutopilot(task, { enabled: true, minimumScore: 70 }, DEFAULT_AGENT_POLICY);
  assert.equal(decision.allowed, false);
  assert.ok(decision.reasons.includes("Job score is below the autopilot threshold."));
});
