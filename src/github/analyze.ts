import { createFingerprint } from "../fingerprint/create.js";
import type { GitHubProfile, GitHubRepository } from "./types.js";
const LANGUAGE_MAP: Record<string,string[]> = { JavaScript:["javascript","software-developer"],TypeScript:["typescript","software-developer"],Python:["python","data","software-developer"],Rust:["rust","software-developer"],Solidity:["blockchain","web3"],SQL:["sql","data"] };
export function analyzeGitHub(profile: GitHubProfile) {
  const skills = new Set<string>(), tools = new Set<string>(), domains = new Set<string>(), roles = new Set<string>();
  for (const repo of profile.repositories) {
    if (repo.language && LANGUAGE_MAP[repo.language]) for (const s of LANGUAGE_MAP[repo.language]) (s === "software-developer" ? roles : s === "data" || s === "blockchain" || s === "web3" ? domains : skills).add(s);
    repo.topics.forEach((topic) => { skills.add(topic); if (["ai","automation","healthcare","web3","blockchain","data"].includes(topic)) domains.add(topic); });
  }
  return createFingerprint({ kind:"candidate", title:`GitHub @${profile.username}`, skills:[...skills], tools:[...tools], domains:[...domains], roles:[...roles], remoteEligible:true, remoteScope:"worldwide", evidence: profile.repositories.map((repo) => ({ source: repo.url, description: repo.description ?? repo.name, signals: [repo.language ?? "", ...repo.topics].filter(Boolean) })) });
}
