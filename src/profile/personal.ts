import { createFingerprint } from "../fingerprint/create.js";
import { matchFingerprints } from "../matching/similarity.js";

export const personalCandidate = createFingerprint({
  kind: "candidate",
  title: "Pharmacist • AI/Data • Software & Automation",
  skills: [
    "pharmacy", "AI", "data annotation", "AI evaluation", "LLM evaluation",
    "data quality", "research", "JavaScript", "TypeScript", "automation",
    "full-stack development", "product building", "technical problem solving"
  ],
  tools: ["Next.js", "Supabase", "GitHub", "Vercel", "APIs"],
  domains: ["healthcare", "healthtech", "AI", "data", "automation", "pharmaceutical", "Web3", "blockchain"],
  roles: [
    "AI evaluator", "data annotator", "AI trainer", "data quality",
    "healthtech", "pharmacist", "software developer", "automation",
    "product operations", "research", "technical support"
  ],
  locations: ["Nigeria"],
  remoteEligible: true,
  remoteScope: "worldwide",
  evidence: [
    { source: "professional", description: "Licensed pharmacist with healthcare and pharmaceutical knowledge.", signals: ["pharmacy", "healthcare", "pharmaceutical"] },
    { source: "portfolio", description: "Public portfolio demonstrates software, AI, healthcare and automation work.", signals: ["software", "AI", "healthtech", "automation"] },
    { source: "github", description: "Public repositories demonstrate full-stack, data, AI and blockchain projects.", signals: ["javascript", "typescript", "data", "Web3", "blockchain"] },
    { source: "data-work", description: "Data annotation and AI evaluation capability.", signals: ["data-annotation", "ai-evaluation", "llm-evaluation", "data-quality"] }
  ]
});

export interface CandidateJobPair {
  title: string;
  job: ReturnType<typeof createFingerprint>;
}

export function rankJobs(jobs: CandidateJobPair[]) {
  return jobs
    .map(({ title, job }) => ({ title, result: matchFingerprints(personalCandidate, job) }))
    .sort((a, b) => Number(b.result.eligible) - Number(a.result.eligible) || b.result.score - a.result.score);
}

export { defaultPersonalPreferences, matchPersonalJobs, selectCvForJob } from "./job-search.js";

export * from "./evidence-fusion.js";
