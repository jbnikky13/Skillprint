import type { CareerFingerprint, MatchResult, SkillSignal } from "../fingerprint/types.js";

function signalWeight(signal: SkillSignal): number {
  const evidenceMultiplier = {
    claimed: 0.7,
    demonstrated: 1,
    verified: 1.15,
    inferred: 0.5
  }[signal.evidence];

  return signal.weight * evidenceMultiplier;
}

function overlap(
  candidate: SkillSignal[],
  job: SkillSignal[]
): { score: number; matched: string[]; missing: string[] } {
  const candidateMap = new Map(candidate.map((item) => [item.name, item]));
  const matched: string[] = [];
  const missing: string[] = [];
  let total = 0;
  let achieved = 0;

  for (const requirement of job) {
    const weight = signalWeight(requirement);
    total += weight;

    const candidateSignal = candidateMap.get(requirement.name);

    if (candidateSignal) {
      achieved += Math.min(signalWeight(candidateSignal), weight);
      matched.push(requirement.name);
    } else {
      missing.push(requirement.name);
    }
  }

  return {
    score: total === 0 ? 1 : achieved / total,
    matched,
    missing
  };
}

export function matchFingerprints(
  candidate: CareerFingerprint,
  job: CareerFingerprint
): MatchResult {
  const skill = overlap(candidate.skills, job.skills);
  const tool = overlap(candidate.tools, job.tools);
  const domain = overlap(candidate.domains, job.domains);
  const role = overlap(candidate.roles, job.roles);

  const score =
    skill.score * 0.4 +
    tool.score * 0.2 +
    domain.score * 0.2 +
    role.score * 0.2;

  const matched = [
    ...skill.matched,
    ...tool.matched,
    ...domain.matched,
    ...role.matched
  ];

  const missing = [
    ...skill.missing,
    ...tool.missing,
    ...domain.missing,
    ...role.missing
  ];

  const confidence = Math.min(
    0.99,
    0.55 +
      Math.min(0.2, matched.length / 50) +
      (candidate.evidence?.length ? 0.15 : 0.05)
  );

  return {
    score: Math.round(score * 1000) / 10,
    eligible: true,
    confidence: Math.round(confidence * 100) / 100,
    matched: [...new Set(matched)],
    missing: [...new Set(missing)],
    reasons: [
      matched.length + " opportunity signals matched candidate evidence.",
      missing.length + " signals were not found in the candidate fingerprint."
    ]
  };
}
