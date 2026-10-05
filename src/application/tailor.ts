import type { CareerFingerprint } from "../fingerprint/types.js";
import type { CVProfile } from "../cv/types.js";
import type { NormalizedJob } from "../jobs/types.js";
import type { TailoredCV } from "./types.js";
export function tailorCV(profile:CVProfile,job:NormalizedJob,candidate:CareerFingerprint):TailoredCV {
 const required=new Set(job.fingerprint.skills.map(x=>x.name.toLowerCase()));
 const selectedSkills=profile.skills.filter(x=>required.has(x.toLowerCase()));
 const selectedEvidence=(candidate.evidence??[]).filter(e=>e.signals.some(s=>selectedSkills.includes(s))).map(e=>e.description);
 return {cvId:profile.id,jobId:job.id,headline:profile.label+" | "+job.title,selectedSkills,selectedEvidence,changes:["Prioritized skills supported by the selected CV profile.","Kept evidence tied to existing candidate records."]};
}
