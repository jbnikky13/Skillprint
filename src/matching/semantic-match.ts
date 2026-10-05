import type { CareerFingerprint, MatchResult } from "../fingerprint/types.js";
import { embeddingSimilarity, type EmbeddingProvider } from "./embeddings.js";
import { matchFingerprints } from "./similarity.js";

export interface SemanticMatchResult extends MatchResult {
  semanticScore: number;
}

export async function matchFingerprintsSemantic(candidate: CareerFingerprint, job: CareerFingerprint, provider: EmbeddingProvider): Promise<SemanticMatchResult> {
  const base = matchFingerprints(candidate, job);
  if (!base.eligible) return { ...base, semanticScore: 0 };
  const semanticScore = await embeddingSimilarity(provider, candidate, job);
  const score = Math.round((base.score * 0.8 + semanticScore * 100 * 0.2) * 10) / 10;
  return {
    ...base,
    score,
    semanticScore,
    reasons: [...base.reasons, `Embedding semantic similarity: ${Math.round(semanticScore * 100)}%.`]
  };
}
