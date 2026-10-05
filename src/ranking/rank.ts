import { matchFingerprints } from "../matching/similarity.js";
import { matchFingerprintsSemantic } from "../matching/semantic-match.js";
import type { CareerFingerprint } from "../fingerprint/types.js";
import type { NormalizedJob } from "../jobs/types.js";
import { applicationEffort, opportunityQuality, salaryQuality } from "./quality.js";
import { scamRisk } from "./scam.js";
import { createRuleBasedDeepEvaluator } from "./deep.js";
import type { RankedOpportunity, RankingOptions } from "./types.js";

export async function rankOpportunities(
  candidate: CareerFingerprint,
  jobs: NormalizedJob[],
  options: RankingOptions = {}
): Promise<RankedOpportunity[]> {
  const max = options.maxCandidates ?? jobs.length;
  const base = jobs.map((job) => ({ job, match: matchFingerprints(candidate, job.fingerprint) }))
    .filter((x) => x.match.eligible)
    .sort((a, b) => b.match.score - a.match.score)
    .slice(0, max);

  const deep = options.deepEvaluator ?? createRuleBasedDeepEvaluator();
  const ranked: RankedOpportunity[] = [];
  for (const item of base) {
    const semanticScore = options.semanticProvider
      ? (await matchFingerprintsSemantic(candidate, item.job.fingerprint, options.semanticProvider)).semanticScore
      : 0;
    const deepResult = await deep.evaluate(candidate, item.job);
    const qualityScore = opportunityQuality(item.job);
    const scamScore = scamRisk(item.job);
    const salaryScore = salaryQuality(item.job);
    const effortScore = applicationEffort(item.job);
    const finalScore = Math.round((
      item.match.score * 0.45 +
      semanticScore * 100 * 0.15 +
      deepResult.score * 100 * 0.15 +
      qualityScore * 0.10 +
      (100 - scamScore) * 0.10 +
      salaryScore * 0.03 +
      effortScore * 0.02
    ) * 10) / 10;
    ranked.push({
      job: item.job,
      match: item.match,
      semanticScore,
      qualityScore,
      scamScore,
      salaryQualityScore: salaryScore,
      effortScore,
      finalScore,
      rankReasons: [
        `Fingerprint match: ${item.match.score}%.`,
        `Opportunity quality: ${qualityScore}%.`,
        `Scam safety: ${100 - scamScore}%.`,
        `Application effort score: ${effortScore}%.`,
        ...deepResult.reasons
      ]
    });
  }
  return ranked.sort((a, b) => b.finalScore - a.finalScore);
}
