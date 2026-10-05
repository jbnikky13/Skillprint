import type { CareerFingerprint, MatchResult, SkillSignal } from "../fingerprint/types.js";

function signalWeight(signal: SkillSignal): number {
  return signal.weight * ({ claimed: 0.7, demonstrated: 1, verified: 1.15, inferred: 0.5 }[signal.evidence]);
}

function overlap(candidate: SkillSignal[], job: SkillSignal[]) {
  const map = new Map(candidate.map((x) => [x.name, x]));
  const matched: string[] = []; const missing: string[] = []; let total = 0; let achieved = 0;
  for (const req of job) {
    const w = signalWeight(req); total += w;
    const found = map.get(req.name);
    if (found) {
      achieved += Math.min(signalWeight(found), w);
      matched.push(req.name);
    } else if (req.requirement !== "preferred") missing.push(req.name);
  }
  return { score: total === 0 ? 1 : achieved / total, matched, missing };
}

const SENIORITY: Record<string, number> = {
  intern: 0, entry: 1, junior: 1, mid: 2, "mid-level": 2, senior: 3, lead: 4, principal: 5, staff: 5
};

function compatibility(candidate: CareerFingerprint, job: CareerFingerprint) {
  const seniority = !job.seniority || !candidate.seniority ? 0.7 :
    Math.max(0, 1 - Math.abs((SENIORITY[candidate.seniority.toLowerCase()] ?? 2) - (SENIORITY[job.seniority.toLowerCase()] ?? 2)) / 4);

  const experience = !job.yearsExperience || candidate.yearsExperience === undefined
    ? 0.7
    : Math.min(1, candidate.yearsExperience / job.yearsExperience);

  const salary = !job.salary?.min || !candidate.salary?.max
    ? 0.7
    : candidate.salary.max >= job.salary.min ? 1 : Math.max(0, candidate.salary.max / job.salary.min);

  const authorization = !job.workAuthorization?.length
    ? 1
    : job.workAuthorization.some((x) => candidate.workAuthorization?.includes(x)) ? 1 : 0;

  return { seniority, experience, salary, authorization };
}

function hardEligibility(candidate: CareerFingerprint, job: CareerFingerprint, authorization: number) {
  if (authorization === 0) return { eligible: false, reason: "Required work authorization is not satisfied." };
  if (job.remoteScope === "worldwide") return { eligible: true };
  if (job.remoteEligible && job.remoteScope !== "country" && job.remoteScope !== "region") return { eligible: true };
  if (job.remoteScope === "country" && candidate.locations[0] && job.locations.length && !job.locations.includes(candidate.locations[0]))
    return { eligible: false, reason: "Remote role is restricted to a different country." };
  if (!job.remoteEligible && job.locations.length && !job.locations.some((x) => candidate.locations.includes(x)))
    return { eligible: false, reason: "Candidate location is not eligible for this on-site/hybrid opportunity." };
  return { eligible: true };
}

export function matchFingerprints(candidate: CareerFingerprint, job: CareerFingerprint): MatchResult {
  const skill = overlap(candidate.skills, job.skills);
  const tool = overlap(candidate.tools, job.tools);
  const domain = overlap(candidate.domains, job.domains);
  const role = overlap(candidate.roles, job.roles);
  const compat = compatibility(candidate, job);
  const eligibility = hardEligibility(candidate, job, compat.authorization);

  if (!eligibility.eligible) return {
    score: 0, eligible: false, confidence: 0.98, matched: [], missing: [],
    reasons: [eligibility.reason!],
    breakdown: { skills: 0, tools: 0, domains: 0, roles: 0, seniority: compat.seniority, experience: compat.experience, salary: compat.salary, authorization: compat.authorization }
  };

  const score = skill.score * 0.35 + tool.score * 0.15 + domain.score * 0.15 + role.score * 0.15 +
    compat.seniority * 0.07 + compat.experience * 0.08 + compat.salary * 0.05;

  const matched = [...skill.matched, ...tool.matched, ...domain.matched, ...role.matched];
  const missing = [...skill.missing, ...tool.missing, ...domain.missing, ...role.missing];

  return {
    score: Math.round(score * 1000) / 10,
    eligible: true,
    confidence: Math.round(Math.min(0.99, 0.55 + Math.min(0.2, matched.length / 50) + (candidate.evidence?.length ? 0.15 : 0.05)) * 100) / 100,
    matched: [...new Set(matched)], missing: [...new Set(missing)],
    reasons: [
      matched.length + " opportunity signals matched candidate evidence.",
      missing.length + " required signals were not found.",
      "Compatibility considers seniority, experience, salary and work authorization."
    ],
    breakdown: {
      skills: Math.round(skill.score * 1000) / 10,
      tools: Math.round(tool.score * 1000) / 10,
      domains: Math.round(domain.score * 1000) / 10,
      roles: Math.round(role.score * 1000) / 10,
      seniority: Math.round(compat.seniority * 1000) / 10,
      experience: Math.round(compat.experience * 1000) / 10,
      salary: Math.round(compat.salary * 1000) / 10,
      authorization: Math.round(compat.authorization * 1000) / 10
    }
  };
}
