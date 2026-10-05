import { createEvidenceGraph, evidenceToFingerprint } from "../evidence/graph.js";
import type { CareerFingerprint } from "../fingerprint/types.js";
import type { EvidenceItem } from "../evidence/types.js";
import type { CVProfile } from "../cv/types.js";
import type { PortfolioProfile } from "../portfolio/types.js";
export interface EvidenceSource { source:string; title:string; description?:string; signals:string[]; confidence:number; }
export function fuseCareerEvidence(base:CareerFingerprint,sources:EvidenceSource[]):CareerFingerprint{
 const items:Omit<EvidenceItem,"id">[]=sources.map(s=>({source:s.source,title:s.title,description:s.description,signals:s.signals,confidence:s.confidence}));
 return evidenceToFingerprint(createEvidenceGraph(base.id,items),base);
}
export function cvEvidence(profile:CVProfile):EvidenceSource[]{return [{source:profile.id,title:"CV",description:profile.summary,signals:[...profile.skills,...profile.tools,...profile.targetRoles],confidence:.9}];}
export function portfolioEvidence(profile:PortfolioProfile):EvidenceSource[]{return profile.projects.map(p=>({source:p.url??"portfolio",title:p.title,description:p.description,signals:[...p.technologies,...p.domains,...p.roles],confidence:.85}));}
export function mergeEvidenceSources(base:CareerFingerprint,...sources:EvidenceSource[][]):CareerFingerprint{return fuseCareerEvidence(base,sources.flat());}
