import type { CareerFingerprint, SkillSignal } from "../fingerprint/types.js";

export interface SemanticSimilarity {
  similarity(candidate: string, job: string): number;
}

const RELATED: Record<string, string[]> = {
  "ai-evaluation": ["llm-evaluation", "model-evaluation", "ai-quality", "ai-evaluator"],
  "data-annotation": ["data-labeling", "data-labelling", "ai-training", "human-feedback"],
  "software-developer": ["software-engineer", "full-stack-developer", "developer"],
  "healthtech": ["healthcare", "digital-health", "health-technology"],
  "pharmacist": ["pharmacy", "clinical-pharmacy"],
  "llm-evaluation": ["ai-evaluation", "model-evaluation"],
  "automation": ["workflow-automation", "process-automation"]
};

function relatedScore(a: string, b: string): number {
  if (a === b) return 1;
  const aliases = RELATED[a] ?? [];
  const reverse = RELATED[b] ?? [];
  if (aliases.includes(b) || reverse.includes(a)) return 0.8;
  const at = new Set(a.split("-")); const bt = new Set(b.split("-"));
  const common = [...at].filter((x) => bt.has(x)).length;
  return common ? 0.55 : 0;
}

function best(candidate: SkillSignal[], job: SkillSignal[]): number {
  if (!job.length) return 1;
  return job.reduce((sum, target) => sum + Math.max(...candidate.map((source) => relatedScore(source.name, target.name)), 0), 0) / job.length;
}

export function fingerprintSemanticSimilarity(candidate: CareerFingerprint, job: CareerFingerprint): number {
  const score = best(candidate.skills, job.skills) * 0.4 +
    best(candidate.tools, job.tools) * 0.2 +
    best(candidate.domains, job.domains) * 0.2 +
    best(candidate.roles, job.roles) * 0.2;
  return Math.round(score * 1000) / 1000;
}
