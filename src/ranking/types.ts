import type { CareerFingerprint, MatchResult } from "../fingerprint/types.js";
import type { NormalizedJob } from "../jobs/types.js";

export interface RankedOpportunity {
  job: NormalizedJob;
  match: MatchResult;
  semanticScore: number;
  qualityScore: number;
  scamScore: number;
  salaryQualityScore: number;
  effortScore: number;
  finalScore: number;
  rankReasons: string[];
}

export interface DeepEvaluation {
  score: number;
  confidence: number;
  reasons: string[];
  concerns?: string[];
}

export interface DeepEvaluator {
  evaluate(candidate: CareerFingerprint, job: NormalizedJob): Promise<DeepEvaluation>;
}

export interface RankingOptions {
  semanticProvider?: { embed(text: string): Promise<number[]> };
  deepEvaluator?: DeepEvaluator;
  maxCandidates?: number;
}
