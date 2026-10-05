import { createFingerprint } from "../fingerprint/create.js";
import type { PortfolioProfile } from "./types.js";
export function fingerprintFromPortfolio(profile: PortfolioProfile) {
  return createFingerprint({
    kind: "candidate",
    title: "Portfolio evidence",
    skills: [...new Set(profile.projects.flatMap((p) => [...p.technologies, ...p.roles]))],
    tools: [...new Set(profile.projects.flatMap((p) => p.technologies))],
    domains: [...new Set(profile.projects.flatMap((p) => p.domains))],
    roles: [...new Set(profile.projects.flatMap((p) => p.roles))],
    remoteEligible: true,
    remoteScope: "worldwide",
    evidence: profile.projects.map((p) => ({ source: p.url ?? "portfolio", description: p.description, signals: [...p.technologies, ...p.domains, ...p.roles] }))
  });
}
