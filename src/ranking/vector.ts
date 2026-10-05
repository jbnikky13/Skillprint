import { cosineSimilarity, fingerprintText } from "../matching/embeddings.js";
import type { CareerFingerprint } from "../fingerprint/types.js";
import type { NormalizedJob } from "../jobs/types.js";

export interface VectorCandidate {
  job: NormalizedJob;
  similarity: number;
}

export async function retrieveByVector(
  candidate: CareerFingerprint,
  jobs: NormalizedJob[],
  provider: { embed(text: string): Promise<number[]> },
  limit = 20
): Promise<VectorCandidate[]> {
  const query = await provider.embed(fingerprintText(candidate));
  const scored = await Promise.all(jobs.map(async (job) => ({
    job,
    similarity: cosineSimilarity(query, await provider.embed(fingerprintText(job.fingerprint)))
  })));
  return scored.sort((a, b) => b.similarity - a.similarity).slice(0, limit);
}
