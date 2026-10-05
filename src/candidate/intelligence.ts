import type { CareerFingerprint } from "../fingerprint/types.js";
import { createEvidenceGraph, evidenceToFingerprint, type EvidenceItem } from "../evidence/index.js";
import { fingerprintFromPortfolio } from "../portfolio/index.js";
import { fingerprintFromCV } from "../cv/fingerprint.js";
import type { CVProfile } from "../cv/types.js";
import type { PortfolioProfile } from "../portfolio/types.js";
export function buildCandidateIntelligence(candidateId:string, base:CareerFingerprint, cv?:CVProfile, portfolio?:PortfolioProfile, githubEvidence:EvidenceItem[]=[]){
  const items: EvidenceItem[] = [...githubEvidence];
  if(cv) for(const e of cv.evidence) items.push({source:"cv",title:e.source,signals:e.signals,confidence:.8});
  if(portfolio) for(const p of portfolio.projects) items.push({source:"portfolio",title:p.title,url:p.url,description:p.description,signals:[...p.technologies,...p.domains,...p.roles],confidence:.9});
  const graph=createEvidenceGraph(candidateId,items);
  return evidenceToFingerprint(graph,base);
}
