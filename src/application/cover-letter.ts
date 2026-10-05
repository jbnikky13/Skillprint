import type { CVProfile } from "../cv/types.js";
import type { NormalizedJob } from "../jobs/types.js";
import type { CoverLetter } from "./types.js";
export function generateCoverLetter(profile:CVProfile,job:NormalizedJob):CoverLetter {
 const claims=profile.skills.filter(s=>job.fingerprint.skills.some(x=>x.name.toLowerCase()===s.toLowerCase()));
 const title=job.title; const company=job.company??"your organization";
 const content="Dear Hiring Team,\n\nI am applying for the "+title+" opportunity at "+company+".\nMy "+profile.label.toLowerCase()+" background aligns with this role, particularly in "+(claims.slice(0,5).join(", ")||"the responsibilities described")+".\n\nI would welcome the opportunity to discuss how my documented experience and skills could contribute to the team.\n\nBest regards";
 return {jobId:job.id,cvId:profile.id,content,claims};
}
