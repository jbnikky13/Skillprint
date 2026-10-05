import type { CareerFingerprint } from "../fingerprint/types.js";
import { createEvidenceGraph, evidenceToFingerprint, type EvidenceItem } from "../evidence/index.js";
import type { CVProfile } from "../cv/types.js";
import type { PortfolioProfile } from "../portfolio/types.js";

type NewEvidenceItem = Omit<EvidenceItem, "id">;

export function buildCandidateIntelligence(
  candidateId: string,
  base: CareerFingerprint,
  cv?: CVProfile,
  portfolio?: PortfolioProfile,
  githubEvidence: NewEvidenceItem[] = []
) {
  const items: NewEvidenceItem[] = [...githubEvidence];

  if (cv) {
    for (const evidence of cv.evidence) {
      items.push({
        source: "cv",
        title: evidence.source,
        signals: evidence.signals,
        confidence: 0.8
      });
    }
  }

  if (portfolio) {
    for (const project of portfolio.projects) {
      items.push({
        source: "portfolio",
        title: project.title,
        url: project.url,
        description: project.description,
        signals: [...project.technologies, ...project.domains, ...project.roles],
        confidence: 0.9
      });
    }
  }

  const graph = createEvidenceGraph(candidateId, items);
  return evidenceToFingerprint(graph, base);
}
