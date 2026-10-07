import { createEvidenceGraph, evidenceToFingerprint } from "../evidence/graph.js";
import type { CareerFingerprint } from "../fingerprint/types.js";
import type { EvidenceItem, EvidenceSource } from "../evidence/types.js";
import type { CVProfile } from "../cv/types.js";
import type { PortfolioProfile } from "../portfolio/types.js";

export interface CareerEvidenceSource {
  source: string;
  title: string;
  description?: string;
  signals: string[];
  confidence: number;
}

function normalizeSource(source: string): EvidenceSource {
  return (["cv", "portfolio", "github", "manual"] as const).includes(source as EvidenceSource)
    ? source as EvidenceSource
    : "manual";
}

export function fuseCareerEvidence(base: CareerFingerprint, sources: CareerEvidenceSource[]): CareerFingerprint {
  const items: Omit<EvidenceItem, "id">[] = sources.map((source) => ({
    source: normalizeSource(source.source),
    title: source.title,
    ...(source.description ? { description: source.description } : {}),
    signals: source.signals,
    confidence: source.confidence
  }));
  return evidenceToFingerprint(createEvidenceGraph(base.id ?? "candidate", items), base);
}

export function cvEvidence(profile: CVProfile): CareerEvidenceSource[] {
  return [{
    source: "cv",
    title: profile.label,
    description: profile.name,
    signals: [...profile.skills, ...profile.tools, ...profile.targetRoles],
    confidence: 0.9
  }];
}

export function portfolioEvidence(profile: PortfolioProfile): CareerEvidenceSource[] {
  return profile.projects.map((project) => ({
    source: "portfolio",
    title: project.title,
    description: project.description,
    signals: [...project.technologies, ...project.domains, ...project.roles],
    confidence: 0.85
  }));
}

export function mergeEvidenceSources(base: CareerFingerprint, ...sources: CareerEvidenceSource[][]): CareerFingerprint {
  return fuseCareerEvidence(base, sources.flat());
}
