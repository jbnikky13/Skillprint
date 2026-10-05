import test from "node:test";
import assert from "node:assert/strict";
import { createFingerprint, matchFingerprints } from "../dist/index.js";

test("matches a candidate against a related global remote opportunity", () => {
  const candidate = createFingerprint({
    kind: "candidate",
    title: "Pharmacist and AI Builder",
    skills: ["AI", "data annotation", "javascript"],
    tools: ["Next.js", "Supabase"],
    domains: ["healthtech", "automation"],
    roles: ["AI evaluator", "automation"],
    locations: ["Nigeria"],
    remoteEligible: true
  });

  const job = createFingerprint({
    kind: "job",
    title: "Remote Healthcare AI Evaluator",
    skills: ["AI", "data annotation"],
    tools: ["javascript"],
    domains: ["healthtech"],
    roles: ["AI evaluator"],
    remoteEligible: true
  });

  const result = matchFingerprints(candidate, job);

  assert.equal(result.eligible, true);
  assert.ok(result.score > 70);
  assert.ok(result.matched.includes("ai"));
  assert.ok(result.matched.includes("data-annotation"));
});
