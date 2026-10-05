import type { ApplicationAnswer,CoverLetter,TailoredCV,TruthReport } from "./types.js";
export function validateTruth(candidateClaims:Set<string>,tailored:TailoredCV,letter:CoverLetter,answers:ApplicationAnswer[]):TruthReport {
 const supported=new Set([...candidateClaims].map(x=>x.toLowerCase()));
 const claims=[...tailored.selectedSkills,...letter.claims,...answers.flatMap(a=>a.claims)];
 const unsupportedClaims=[...new Set(claims.filter(x=>!supported.has(x.toLowerCase())))];
 const contradictions=answers.filter(a=>a.confidence===0&&/yes|no|years|experience|authorized|sponsor/i.test(a.question)).map(a=>a.question);
 return {valid:unsupportedClaims.length===0&&contradictions.length===0,unsupportedClaims,contradictions,warnings:[]};
}
