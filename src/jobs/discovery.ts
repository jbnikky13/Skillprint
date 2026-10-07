import { deduplicateJobs } from "./dedupe.js";
import { normalizeJob } from "./normalize.js";
import { filterActiveJobs } from "./expiry.js";
import type { JobSearchQuery, JobSource, NormalizedJob } from "./types.js";

export interface JobDiscoveryResult {
  jobs: NormalizedJob[];
  failures: { source: string; error: string }[];
}

export async function discoverJobsWithFailures(sources: JobSource[], query: JobSearchQuery): Promise<JobDiscoveryResult> {
  const results = await Promise.allSettled(sources.map((source) => source.search(query)));
  const failures = discoveryFailures(sources, results);
  const rawJobs = results.flatMap((result) => result.status === "fulfilled" ? result.value : []);
  const normalized = rawJobs.map(normalizeJob);
  return { jobs: filterActiveJobs(deduplicateJobs(normalized)), failures };
}

export async function discoverJobs(sources: JobSource[], query: JobSearchQuery): Promise<NormalizedJob[]> {
  return (await discoverJobsWithFailures(sources, query)).jobs;
}

export function discoveryFailures(sources: JobSource[], results: PromiseSettledResult<unknown>[]) {
  return results.flatMap((result, index) =>
    result.status === "rejected" ? [{ source: sources[index].id, error: String(result.reason) }] : []
  );
}
