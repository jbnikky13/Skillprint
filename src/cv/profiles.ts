import type { CVProfile } from "./types.js";

export const cvProfiles: CVProfile[] = [
  {
    id: "ai-data",
    name: "AI & Data",
    label: "AI / Data Annotation / Evaluation",
    targetRoles: ["ai-evaluator", "data-annotator", "ai-trainer", "data-quality", "research"],
    priorityDomains: ["ai", "data", "healthcare", "healthtech"],
    skills: ["ai", "data-annotation", "ai-evaluation", "llm-evaluation", "data-quality", "research"],
    tools: ["javascript", "typescript"],
    evidence: [{ source: "data-work", signals: ["data-annotation", "ai-evaluation", "llm-evaluation"] }]
  },
  {
    id: "software-automation",
    name: "Software & Automation",
    label: "Software / Automation / Technical",
    targetRoles: ["software-developer", "automation", "technical-support", "product-operations"],
    priorityDomains: ["software", "automation", "ai", "Web3"],
    skills: ["javascript", "typescript", "automation", "full-stack-development", "product-building"],
    tools: ["nextjs", "supabase", "github", "vercel", "apis"],
    evidence: [{ source: "github", signals: ["javascript", "typescript", "automation"] }]
  },
  {
    id: "pharmacy-healthcare",
    name: "Pharmacy & Healthcare",
    label: "Pharmacy / Pharmaceutical / Healthtech",
    targetRoles: ["pharmacist", "healthcare", "healthtech", "research"],
    priorityDomains: ["healthcare", "healthtech", "pharmaceutical"],
    skills: ["pharmacy", "healthcare", "pharmaceutical", "research"],
    tools: [],
    evidence: [{ source: "professional", signals: ["pharmacy", "healthcare", "pharmaceutical"] }]
  },
  {
    id: "web3",
    name: "Web3 & Blockchain",
    label: "Web3 / Blockchain / Product",
    targetRoles: ["blockchain", "web3", "software-developer", "product-operations"],
    priorityDomains: ["Web3", "blockchain", "software"],
    skills: ["javascript", "typescript", "blockchain", "product-building"],
    tools: ["github", "vercel", "apis"],
    evidence: [{ source: "portfolio", signals: ["blockchain", "Web3"] }]
  }
];
