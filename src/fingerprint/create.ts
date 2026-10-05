import { createHash } from "node:crypto";
import { normalizeSignals } from "./normalize.js";
import type { CareerFingerprint, EvidenceLevel, SkillSignal } from "./types.js";
export interface FingerprintInput {
  kind: "candidate" | "job"; title?: string; skills?: string[]; tools?: string[]; domains?: string[]; roles?: string[];
  seniority?: string; yearsExperience?: number; locations?: string[]; remoteEligible?: boolean;
  remoteScope?: CareerFingerprint["remoteScope"]; workAuthorization?: string[]; education?: string[];
  certifications?: string[]; languages?: string[]; preferences?: CareerFingerprint["preferences"];
  evidence?: CareerFingerprint["evidence"];
}
function signals(values: string[] = [], evidence: EvidenceLevel = "claimed"): SkillSignal[] {
  return normalizeSignals(values).map((name) => ({ name, weight: 1, evidence }));
}
export function createFingerprint(input: FingerprintInput): CareerFingerprint {
  const fingerprint: CareerFingerprint = {
    version: 1, kind: input.kind, title: input.title, skills: signals(input.skills), tools: signals(input.tools),
    domains: signals(input.domains), roles: signals(input.roles), seniority: input.seniority,
    yearsExperience: input.yearsExperience, locations: normalizeSignals(input.locations ?? []),
    remoteEligible: input.remoteEligible ?? false, remoteScope: input.remoteScope,
    workAuthorization: normalizeSignals(input.workAuthorization ?? []), education: normalizeSignals(input.education ?? []),
    certifications: normalizeSignals(input.certifications ?? []), languages: normalizeSignals(input.languages ?? []),
    preferences: input.preferences, evidence: input.evidence
  };
  fingerprint.id = createHash("sha256").update(JSON.stringify(fingerprint)).digest("hex").slice(0, 16);
  return fingerprint;
}
