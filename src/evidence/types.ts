export type EvidenceSource = "cv" | "portfolio" | "github" | "manual";
export interface EvidenceItem {
  id: string;
  source: EvidenceSource;
  sourceId?: string;
  title: string;
  url?: string;
  description?: string;
  signals: string[];
  confidence: number;
  observedAt?: string;
  metadata?: Record<string, string | number | boolean>;
}
export interface EvidenceGraph {
  version: 1;
  candidateId: string;
  nodes: EvidenceItem[];
  edges: { from: string; to: string; relation: "supports" | "demonstrates" | "corroborates" }[];
}
