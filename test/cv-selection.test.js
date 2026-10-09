import test from "node:test";
import assert from "node:assert/strict";
import { createFingerprint } from "../dist/index.js";
import { cvProfiles, selectBestCV } from "../dist/cv/index.js";

test("selects AI CV for an AI evaluation role", () => {
  const job = createFingerprint({
    kind: "job",
    title: "Remote AI Data Evaluator",
    skills: ["AI", "data annotation", "LLM evaluation"],
    domains: ["AI", "data"],
    roles: ["AI evaluator"],
    remoteEligible: true,
    remoteScope: "worldwide"
  });

  const ranked = selectBestCV(job, cvProfiles);
  assert.equal(ranked[0].cvId, "ai-data");
});

test("selects pharmacy CV for pharmacist role", () => {
  const job = createFingerprint({
    kind: "job",
    title: "Pharmacist",
    skills: ["pharmacy", "healthcare"],
    domains: ["healthcare", "pharmaceutical"],
    roles: ["pharmacist"],
    remoteEligible: false,
    remoteScope: "onsite",
    locations: ["Nigeria"]
  });

  const ranked = selectBestCV(job, cvProfiles);
  assert.equal(ranked[0].cvId, "pharmacy-healthcare");
});

test("does not crash when a stored job fingerprint is missing signal arrays", () => {
  const ranked = selectBestCV({ kind: "job" }, cvProfiles);
  assert.equal(ranked.length, cvProfiles.length);
  assert.ok(ranked[0].cvId);
});
