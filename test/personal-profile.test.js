import test from "node:test";
import assert from "node:assert/strict";
import { createFingerprint } from "../dist/index.js";
import { personalCandidate, rankJobs } from "../dist/profile/personal.js";

test("personal candidate is globally remote eligible", () => {
  assert.equal(personalCandidate.kind, "candidate");
  assert.equal(personalCandidate.remoteEligible, true);
  assert.equal(personalCandidate.remoteScope, "worldwide");
});

test("personal candidate ranks AI-healthcare work strongly", () => {
  const jobs = [
    {
      title: "Remote Healthcare AI Evaluator",
      job: createFingerprint({
        kind: "job",
        title: "Remote Healthcare AI Evaluator",
        skills: ["AI", "data annotation", "LLM evaluation"],
        tools: ["JavaScript"],
        domains: ["healthcare", "AI"],
        roles: ["AI evaluator"],
        remoteEligible: true,
        remoteScope: "worldwide"
      })
    },
    {
      title: "Senior Rust Kernel Engineer",
      job: createFingerprint({
        kind: "job",
        title: "Senior Rust Kernel Engineer",
        skills: ["Rust", "Linux kernel"],
        roles: ["kernel engineer"],
        remoteEligible: true,
        remoteScope: "worldwide"
      })
    }
  ];

  const ranked = rankJobs(jobs);
  assert.equal(ranked[0].title, "Remote Healthcare AI Evaluator");
  assert.ok(ranked[0].result.score > ranked[1].result.score);
});
