import type { JobSearchQuery, JobSource, NormalizedJob } from "./types.js";
import { discoverJobs } from "./discovery.js";

export interface DiscoverySchedule { intervalMs: number; query: JobSearchQuery; }
export interface DiscoveryScheduler { start(): void; stop(): void; runOnce(): Promise<NormalizedJob[]>; }

export function createDiscoveryScheduler(
  sources: JobSource[],
  schedule: DiscoverySchedule,
  onResult?: (jobs: NormalizedJob[]) => void
): DiscoveryScheduler {
  let timer: ReturnType<typeof setInterval> | undefined;
  const runOnce = async () => {
    const jobs = await discoverJobs(sources, schedule.query);
    onResult?.(jobs);
    return jobs;
  };
  return {
    start() { if (!timer) timer = setInterval(() => { void runOnce(); }, schedule.intervalMs); },
    stop() { if (timer) { clearInterval(timer); timer = undefined; } },
    runOnce
  };
}
