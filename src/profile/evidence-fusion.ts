import { createEvidenceGraph, evidenceToFingerprint } from "../evidence/graph.js";
import type { CareerFingerprint } from "../fingerprint/types.js";
import type { EvidenceItem } from "../evidence/types.js";
import type { CVProfile } from "../cv/types.js";
import type { PortfolioProfile } from "../portfolio/types.js";
export interface CareerEvidenceSource { source:string; title:string; description?:string; signals:string[]; confidence:number; }
export function fuseCareerEvidence(base:CareerFingerprint,sources:CareerEvidenceSource[]):CareerFingerprint{
 const items:Omit<EvidenceItem,"id">[]=sources.map(s=>({source: (["cv","portfolio","github","manual"] as const).includes(s.source as any) ? s.source as "cv"|"portfolio"|"github"|"manual" : "manual",title:s.title,description:s.description,signals:s.signals,confidence:s.confidence}));
 return evidenceToFingerprint(createEvidenceGraph(base.id ?? "candidate",items),base);
}
export function cvEvidence(profile:CVProfile):CareerEvidenceSource[]{return [{source:profile.id,title:"CV",description:profile.label,signals:[...profile.skills,...profile.tools,...profile.targetRoles],confidence:.9}];}
export function portfolioEvidence(profile:PortfolioProfile):CareerEvidenceSource[]{return profile.projects.map(p=>({source:"portfolio",title:p.title,description:p.description,signals:[...p.technologies,...p.domains,...p.roles],confidence:.85}));}
export function mergeEvidenceSources(base:CareerFingerprint,...sources:CareerEvidenceSource[][]):CareerFingerprint{return fuseCareerEvidence(base,sources.flat());}
