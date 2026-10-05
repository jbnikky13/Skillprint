import { discoverJobs } from "./discovery.js";
import type { JobSearchQuery, JobSource, NormalizedJob } from "./types.js";
import { rankOpportunities } from "../ranking/rank.js";
import type { CareerFingerprint } from "../fingerprint/types.js";
import type { CareerCommandCenter } from "../command-center/store.js";
import { matchPersonalJobs, type PersonalJobPreferences, defaultPersonalPreferences } from "../profile/job-search.js";
export interface LiveDiscoveryResult{jobs:NormalizedJob[];rankedCount:number;failures:string[];personalMatches?:ReturnType<typeof matchPersonalJobs>;}
export async function discoverAndRankLiveJobs(
 sources:JobSource[], candidate:CareerFingerprint, query:JobSearchQuery, center?:CareerCommandCenter, preferences:PersonalJobPreferences=defaultPersonalPreferences
):Promise<LiveDiscoveryResult>{
 const settled=await Promise.allSettled(sources.map(s=>s.search(query)));
 const failures=settled.flatMap((r,i)=>r.status==="rejected"?[sources[i].id+": "+String(r.reason)]:[]);
 const jobs=await discoverJobs(sources,query);
 const ranked=await rankOpportunities(candidate,jobs);
 if(center)center.ingest(ranked);
 const personalMatches=matchPersonalJobs(ranked.map(x=>x.job),preferences);
 return {jobs,rankedCount:ranked.length,failures,personalMatches};
}
