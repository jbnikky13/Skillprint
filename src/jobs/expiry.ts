import type { NormalizedJob } from "./types.js";
export function jobIsExpired(job:NormalizedJob, now=new Date()):boolean {
  if(job.status==="expired") return true;
  if(job.expiresAt) return Date.parse(job.expiresAt)<=now.getTime();
  return false;
}
export function filterActiveJobs(jobs:NormalizedJob[], now=new Date()):NormalizedJob[]{
  return jobs.filter(job=>!jobIsExpired(job,now)).map(job=>({...job,status:"active"}));
}
