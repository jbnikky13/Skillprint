import type { NormalizedJob } from "./types.js";
export function deduplicateJobs(jobs:NormalizedJob[]):NormalizedJob[]{
  const seen=new Map<string,NormalizedJob>();
  for(const job of jobs){
    const key=job.externalId ? `${job.source}:${job.externalId}` : job.url.replace(/[#?].*$/,"").replace(/\/$/,"").toLowerCase();
    const existing=seen.get(key);
    if(!existing || Date.parse(job.postedAt ?? "") > Date.parse(existing.postedAt ?? "")) seen.set(key,job);
  }
  return [...seen.values()];
}
