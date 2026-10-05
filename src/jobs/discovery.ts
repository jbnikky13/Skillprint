import { deduplicateJobs } from "./dedupe.js";
import { normalizeJob } from "./normalize.js";
import { filterActiveJobs } from "./expiry.js";
import type { JobSearchQuery, JobSource, NormalizedJob } from "./types.js";
export async function discoverJobs(sources:JobSource[],query:JobSearchQuery):Promise<NormalizedJob[]>{
  const results=await Promise.allSettled(sources.map(source=>source.search(query)));
  const jobs=results.flatMap(result=>result.status==="fulfilled"?result.value:[]);
  return filterActiveJobs(deduplicateJobs(jobs).map(normalizeJob));
}
export function discoveryFailures(sources:JobSource[],results:PromiseSettledResult<unknown>[]){
  return results.flatMap((r,i)=>r.status==="rejected"?[{source:sources[i].id,error:String(r.reason)}]:[]);
}
