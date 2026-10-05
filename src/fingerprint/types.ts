export type EvidenceLevel =
  | "claimed"
  | "demonstrated"
  | "verified"
  | "inferred";

export interface SkillSignal {
  name: string;
  weight: number;
  evidence: EvidenceLevel;
  aliases?: string[];
}

export interface CareerFingerprint {
  id?: string;
  version: 1;
  kind: "candidate" | "job";
  title?: string;
  skills: SkillSignal[];
  tools: SkillSignal[];
  domains: SkillSignal[];
  roles: SkillSignal[];
  seniority?: string;
  yearsExperience?: number;
  locations: string[];
  remoteEligible: boolean;
  workAuthorization?: string[];
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  education?: string[];
  certifications?: string[];
  languages?: string[];
  evidence?: {
    source: string;
    description: string;
    signals: string[];
  }[];
}

export interface MatchResult {
  score: number;
  eligible: boolean;
  confidence: number;
  matched: string[];
  missing: string[];
  reasons: string[];
}
