export type EvidenceLevel = "claimed" | "demonstrated" | "verified" | "inferred";
export type RequirementLevel = "required" | "preferred";

export interface SkillSignal {
  name: string;
  weight: number;
  evidence: EvidenceLevel;
  requirement?: RequirementLevel;
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
  remoteScope?: "worldwide" | "country" | "region" | "hybrid" | "onsite" | "unknown";
  workAuthorization?: string[];
  salary?: { min?: number; max?: number; currency?: string };
  education?: string[];
  certifications?: string[];
  languages?: string[];
  preferences?: { industries?: string[]; roleTypes?: string[]; employmentTypes?: string[] };
  evidence?: { source: string; description: string; signals: string[] }[];
}

export interface MatchResult {
  score: number;
  eligible: boolean;
  confidence: number;
  matched: string[];
  missing: string[];
  reasons: string[];
  breakdown: {
    skills: number;
    tools: number;
    domains: number;
    roles: number;
    seniority: number;
    experience: number;
    salary: number;
    authorization: number;
  };
}
