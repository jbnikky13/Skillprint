import test from "node:test";
import assert from "node:assert/strict";
import { personalCandidate } from "../dist/profile/personal.js";
import { benchmarkJobs } from "../dist/benchmark/jobs.js";
import { matchFingerprints } from "../dist/matching/similarity.js";
import { fingerprintSemanticSimilarity } from "../dist/matching/semantic.js";

test("benchmark ranks relevant career families above unrelated roles", () => {
  const ranked = benchmarkJobs.map((job) => ({ title: job.title, score: matchFingerprints(personalCandidate, job).score }))
    .sort((a, b) => b.score - a.score);
  assert.ok(["AI Data Evaluator", "Healthcare AI Specialist", "Pharmacist", "Automation Developer"].includes(ranked[0].title));
  assert.ok(ranked.find((x) => x.title === "Senior Kernel Engineer").score < ranked[0].score);
  assert.ok(ranked.find((x) => x.title === "Marketing Manager").score < ranked[0].score);
});

test("semantic layer recognizes related terminology", () => {
  const score = fingerprintSemanticSimilarity(
    personalCandidate,
    benchmarkJobs[0]
  );
  assert.ok(score > 0.25);
});
