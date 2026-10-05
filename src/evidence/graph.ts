import { createHash } from "node:crypto";
import { normalizeSignals } from "../fingerprint/normalize.js";
import type { CareerFingerprint } from "../fingerprint/types.js";
import type { EvidenceGraph, EvidenceItem } from "./types.js";

export function evidenceId(item: Omit<EvidenceItem, "id">): string {
  return createHash("sha256").update(JSON.stringify(item)).digest("hex").slice(0, 16);
}
export function createEvidenceGraph(candidateId: string, items: Omit<EvidenceItem, "id">[]): EvidenceGraph {
  const nodes = items.map((item) => ({ ...item, id: evidenceId(item), signals: normalizeSignals(item.signals) }));
  const edges: EvidenceGraph["edges"] = [];
  for (const node of nodes) for (const other of nodes) {
    if (node.id === other.id) continue;
    if (node.signals.some((signal) => other.signals.includes(signal)))
      edges.push({ from: node.id, to: other.id, relation: "corroborates" });
  }
  return { version: 1, candidateId, nodes, edges };
}
export function evidenceToFingerprint(graph: EvidenceGraph, base: CareerFingerprint): CareerFingerprint {
  const weights = new Map<string, { weight: number; count: number }>();
  for (const node of graph.nodes) for (const signal of node.signals) {
    const current = weights.get(signal) ?? { weight: 0, count: 0 };
    current.weight += node.confidence; current.count++;
    weights.set(signal, current);
  }
  const strengthen = (signals: CareerFingerprint["skills"]) => signals.map((signal) => {
    const item = weights.get(signal.name);
    return item ? { ...signal, weight: Math.min(2, signal.weight + item.weight / item.count) } : signal;
  });
  return { ...base, skills: strengthen(base.skills), tools: strengthen(base.tools), domains: strengthen(base.domains), roles: strengthen(base.roles), evidence: graph.nodes.map((x) => ({ source: x.source, description: x.description ?? x.title, signals: x.signals })) };
}
