import { createHash } from "node:crypto";
import { normalizeSignals } from "./normalize.js";
import type { CareerFingerprint, EvidenceLevel, RequirementLevel, SkillSignal } from "./types.js";

export interface SignalInput {
  name: string;
  weight?: number;
  evidence?: EvidenceLevel;
  requirement?: RequirementLevel;
}
export interface FingerprintInput {
  kind: "candidate" | "job";
  title?: string;
  skills?: string[] | SignalInput[];
  tools?: string[] | SignalInput[];
  domains?: string[] | SignalInput[];
  roles?: string[] | SignalInput[];
  seniority?: string;
  yearsExperience?: number;
  locations?: string[];
  remoteEligible?: boolean;
  remoteScope?: CareerFingerprint["remoteScope"];
  workAuthorization?: string[];
  salary?: CareerFingerprint["salary"];
  education?: string[];
  certifications?: string[];
  languages?: string[];
  preferences?: CareerFingerprint["preferences"];
  evidence?: CareerFingerprint["evidence"];
}

function signals(values: string[] | SignalInput[] = [], evidence: EvidenceLevel = "claimed"): SkillSignal[] {
  return values.map((value) => typeof value === "string"
    ? { name: normalizeSignals([value])[0], weight: 1, evidence }
    : { name: normalizeSignals([value.name])[0], weight: value.weight ?? 1, evidence: value.evidence ?? evidence, requirement: value.requirement });
}

export function createFingerprint(input: FingerprintInput): CareerFingerprint {
  const fingerprint: CareerFingerprint = {
    version: 1,
    kind: input.kind,
    title: input.title,
    skills: signals(input.skills),
    tools: signals(input.tools),
    domains: signals(input.domains),
    roles: signals(input.roles),
    seniority: input.seniority,
    yearsExperience: input.yearsExperience,
    locations: normalizeSignals(input.locations ?? []),
    remoteEligible: input.remoteEligible ?? false,
    remoteScope: input.remoteScope,
    workAuthorization: normalizeSignals(input.workAuthorization ?? []),
    salary: input.salary,
    education: normalizeSignals(input.education ?? []),
    certifications: normalizeSignals(input.certifications ?? []),
    languages: normalizeSignals(input.languages ?? []),
    preferences: input.preferences,
    evidence: input.evidence
  };
  fingerprint.id = createHash("sha256").update(JSON.stringify(fingerprint)).digest("hex").slice(0, 16);
  return fingerprint;
}
