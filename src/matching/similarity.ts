import type { CareerFingerprint, MatchResult, SkillSignal } from "../fingerprint/types.js";
function signalWeight(signal: SkillSignal): number {
  return signal.weight * ({ claimed: 0.7, demonstrated: 1, verified: 1.15, inferred: 0.5 }[signal.evidence]);
}
function overlap(candidate: SkillSignal[], job: SkillSignal[]) {
  const map = new Map(candidate.map((x) => [x.name, x]));
  const matched: string[] = []; const missing: string[] = []; let total = 0; let achieved = 0;
  for (const req of job) {
    const w = signalWeight(req); total += w; const found = map.get(req.name);
    if (found) { achieved += Math.min(signalWeight(found), w); matched.push(req.name); } else missing.push(req.name);
  }
  return { score: total === 0 ? 1 : achieved / total, matched, missing };
}
function hardEligibility(candidate: CareerFingerprint, job: CareerFingerprint) {
  if (job.remoteScope === "worldwide") return { eligible: true };
  if (job.remoteEligible && job.remoteScope !== "country" && job.remoteScope !== "region") return { eligible: true };
  if (job.remoteScope === "country" && candidate.locations[0] && job.locations.length && !job.locations.includes(candidate.locations[0]))
    return { eligible: false, reason: "Remote role is restricted to a different country." };
  if (!job.remoteEligible && job.locations.length && !job.locations.some((x) => candidate.locations.includes(x)))
    return { eligible: false, reason: "Candidate location is not eligible for this on-site/hybrid opportunity." };
  return { eligible: true };
}
export function matchFingerprints(candidate: CareerFingerprint, job: CareerFingerprint): MatchResult {
  const eligibility = hardEligibility(candidate, job);
  if (!eligibility.eligible) return { score: 0, eligible: false, confidence: 0.98, matched: [], missing: [], reasons: [eligibility.reason!], breakdown: { skills: 0, tools: 0, domains: 0, roles: 0 } };
  const skill = overlap(candidate.skills as SkillSignal[], job.skills as SkillSignal[]);
  const tool = overlap(candidate.tools as SkillSignal[], job.tools as SkillSignal[]);
  const domain = overlap(candidate.domains as SkillSignal[], job.domains as SkillSignal[]);
  const role = overlap(candidate.roles as SkillSignal[], job.roles as SkillSignal[]);
  const score = skill.score * 0.4 + tool.score * 0.2 + domain.score * 0.2 + role.score * 0.2;
  const matched = [...skill.matched, ...tool.matched, ...domain.matched, ...role.matched];
  const missing = [...skill.missing, ...tool.missing, ...domain.missing, ...role.missing];
  return {
    score: Math.round(score * 1000) / 10, eligible: true,
    confidence: Math.round(Math.min(0.99, 0.55 + Math.min(0.2, matched.length / 50) + (candidate.evidence?.length ? 0.15 : 0.05)) * 100) / 100,
    matched: [...new Set(matched)], missing: [...new Set(missing)],
    reasons: [matched.length + " opportunity signals matched candidate evidence.", missing.length + " signals were not found in the candidate fingerprint."],
    breakdown: { skills: Math.round(skill.score * 1000) / 10, tools: Math.round(tool.score * 1000) / 10, domains: Math.round(domain.score * 1000) / 10, roles: Math.round(role.score * 1000) / 10 }
  };
}
