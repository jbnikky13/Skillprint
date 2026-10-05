import test from "node:test";
import assert from "node:assert/strict";
import { cosineSimilarity, embeddingSimilarity, fingerprintText } from "../dist/matching/embeddings.js";
import { personalCandidate } from "../dist/profile/personal.js";
import { benchmarkJobs } from "../dist/benchmark/jobs.js";
import { matchFingerprintsSemantic } from "../dist/matching/semantic-match.js";

test("cosine similarity is normalized", () => {
  assert.equal(cosineSimilarity([1, 0], [1, 0]), 1);
  assert.equal(cosineSimilarity([1, 0], [0, 1]), 0);
});

test("fingerprints become stable semantic input text", () => {
  const text = fingerprintText(personalCandidate);
  assert.match(text, /skill:/);
  assert.match(text, /domain:/);
});

test("embedding provider is actually used for semantic similarity", async () => {
  const provider = { async embed(text) {
    return text.includes("AI Data Evaluator") ? [1, 0, 0] : [0.9, 0.1, 0];
  }};
  const score = await embeddingSimilarity(provider, personalCandidate, benchmarkJobs[0]);
  assert.ok(score > 0.9);
});

test("semantic matcher blends deterministic and embedding scores", async () => {
  const provider = { async embed() { return [1, 0]; }};
  const result = await matchFingerprintsSemantic(personalCandidate, benchmarkJobs[0], provider);
  assert.equal(result.semanticScore, 1);
  assert.ok(result.score >= 80);
});
