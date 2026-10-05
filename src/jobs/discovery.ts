import { deduplicateJobs } from "./dedupe.js";
import { normalizeJob } from "./normalize.js";
import { filterActiveJobs } from "./expiry.js";
import type { JobSearchQuery, JobSource, NormalizedJob } from "./types.js";

export async function discoverJobs(sources: JobSource[], query: JobSearchQuery): Promise<NormalizedJob[]> {
  const results = await Promise.allSettled(sources.map((source) => source.search(query)));
  const rawJobs = results.flatMap((result) => result.status === "fulfilled" ? result.value : []);
  const normalized = rawJobs.map(normalizeJob);
  return filterActiveJobs(deduplicateJobs(normalized));
}

export function discoveryFailures(
  sources: JobSource[],
  results: PromiseSettledResult<unknown>[]
) {
  return results.flatMap((result, index) =>
    result.status === "rejected"
      ? [{ source: sources[index].id, error: String(result.reason) }]
      : []
  );
}
