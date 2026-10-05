import { normalizeSignals } from "../fingerprint/normalize.js";
import type { CVProfile } from "./types.js";
import type { ParsedCV } from "./parse.js";

const VOCAB: Record<string, string[]> = {
  skills: ["javascript", "typescript", "python", "sql", "ai", "machine learning", "data annotation", "llm evaluation", "ai evaluation", "data quality", "research", "pharmacy", "healthcare", "automation", "blockchain", "web3", "full stack development"],
  tools: ["next.js", "supabase", "github", "vercel", "react", "node.js", "docker", "git"],
  roles: ["pharmacist", "ai evaluator", "data annotator", "ai trainer", "software developer", "automation", "research", "data quality", "technical support", "product operations"],
  domains: ["healthcare", "healthtech", "pharmaceutical", "ai", "data", "automation", "web3", "blockchain", "software"]
};

function findSignals(text: string, values: string[]): string[] {
  const lower = text.toLowerCase();
  return normalizeSignals(values.filter((value) => lower.includes(value.toLowerCase())));
}

export function extractCVProfile(parsed: ParsedCV, id = parsed.fileName.toLowerCase().replace(/[^a-z0-9]+/g, "-")): CVProfile {
  const all = parsed.text;
  return {
    id,
    name: parsed.fileName,
    label: "Extracted CV profile",
    targetRoles: findSignals(all, VOCAB.roles),
    priorityDomains: findSignals(all, VOCAB.domains),
    skills: findSignals(all, VOCAB.skills),
    tools: findSignals(all, VOCAB.tools),
    evidence: [{ source: parsed.fileName, signals: findSignals(all, [...VOCAB.skills, ...VOCAB.tools, ...VOCAB.roles, ...VOCAB.domains]) }],
    fileName: parsed.fileName
  };
}
