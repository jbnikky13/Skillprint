import { personalCandidate } from "./personal.js";
import { cvProfiles } from "../cv/profiles.js";
import { matchFingerprints } from "../matching/similarity.js";
import type { NormalizedJob } from "../jobs/types.js";

export interface PersonalJobPreferences {
  locations:string[];
  remoteOnly:boolean;
  minimumScore:number;
  preferredRoles:string[];
  excludedKeywords:string[];
}
export interface PersonalJobMatch {
  job:NormalizedJob;
  score:number;
  eligible:boolean;
  recommendedCvId:string;
  reasons:string[];
}
const norm=(x:string)=>x.toLowerCase().replace(/[^a-z0-9]+/g,"-");
export function selectCvForJob(job:NormalizedJob):string{
 const text=norm(job.title+" "+job.description);
 return cvProfiles
  .map(cv=>({id:cv.id,score:cv.skills.reduce((n,s)=>n+(text.includes(norm(s))?2:0),0)+cv.targetRoles.reduce((n,s)=>n+(text.includes(norm(s))?3:0),0)}))
  .sort((a,b)=>b.score-a.score)[0]?.id??"ai-data";
}
export function matchPersonalJobs(jobs:NormalizedJob[],preferences:PersonalJobPreferences):PersonalJobMatch[]{
 return jobs.map(job=>{
   const text=norm(job.title+" "+job.description+" "+(job.location??""));
   const excluded=preferences.excludedKeywords.some(k=>text.includes(norm(k)));
   const remoteOk=!preferences.remoteOnly||Boolean(job.remote);
   const locationOk=!preferences.locations.length||preferences.locations.some(l=>text.includes(norm(l))||job.remote);
   const result=matchFingerprints(personalCandidate,job.fingerprint);
   const score=result.score;
   const reasons=[
    result.eligible?"Profile is eligible":"Profile eligibility is limited",
    job.remote?"Remote":"Location-based",
    "CV: "+selectCvForJob(job)
   ];
   return {job,score,eligible:Boolean(result.eligible)&&remoteOk&&locationOk&&!excluded&&score>=preferences.minimumScore,recommendedCvId:selectCvForJob(job),reasons};
 }).sort((a,b)=>Number(b.eligible)-Number(a.eligible)||b.score-a.score);
}
export const defaultPersonalPreferences:PersonalJobPreferences={
 locations:["Nigeria","Port Harcourt"],remoteOnly:false,minimumScore:55,
 preferredRoles:["AI evaluator","data annotator","automation","software developer","pharmacist"],
 excludedKeywords:["unpaid","commission only"]
};
