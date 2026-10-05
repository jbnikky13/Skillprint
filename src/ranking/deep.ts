import type { CareerFingerprint } from "../fingerprint/types.js";
import type { NormalizedJob } from "../jobs/types.js";
import type { DeepEvaluation, DeepEvaluator } from "./types.js";

export function createRuleBasedDeepEvaluator(): DeepEvaluator {
  return {
    async evaluate(candidate: CareerFingerprint, job: NormalizedJob): Promise<DeepEvaluation> {
      const required = job.fingerprint.skills.filter((x) => x.requirement === "required");
      const candidateNames = new Set(candidate.skills.map((x) => x.name));
      const missingRequired = required.filter((x) => !candidateNames.has(x.name));
      const score = required.length ? Math.max(0, 1 - missingRequired.length / required.length) : 0.75;
      return {
        score,
        confidence: required.length ? 0.9 : 0.6,
        reasons: missingRequired.length
          ? [`${missingRequired.length} required skill(s) are not evidenced directly.`]
          : ["Required skill signals are covered by the candidate fingerprint."],
        concerns: missingRequired.map((x) => `Missing required skill: ${x.name}`)
      };
    }
  };
}
