import type { JobSource, JobSearchQuery, RawJob } from "../types.js";
export function createArbeitnowSource(): JobSource {
  return {
    id: "arbeitnow", name: "Arbeitnow", scope: "global",
    async search(query: JobSearchQuery): Promise<RawJob[]> {
      const url = new URL("https://www.arbeitnow.com/api/job-board-api");
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Arbeitnow returned HTTP ${response.status}`);
      const payload = await response.json() as { data?: Array<Record<string, unknown>> };
      const keywords = (query.keywords ?? []).map((x) => x.toLowerCase());
      return (payload.data ?? []).filter((job) => {
        if (query.remoteOnly && !Boolean(job.remote)) return false;
        if (!keywords.length) return true;
        const haystack = String(job.title ?? "") + " " + String(job.description ?? "") + " " + String(job.company_name ?? "");
        return keywords.some((term) => haystack.toLowerCase().includes(term));
      }).map((job) => ({
        externalId: job.slug ? String(job.slug) : undefined,
        title: String(job.title ?? ""),
        company: String(job.company_name ?? ""),
        description: String(job.description ?? ""),
        url: String(job.url ?? ""),
        location: String(job.location ?? ""),
        remote: Boolean(job.remote),
        postedAt: job.created_at ? String(job.created_at) : undefined,
        source: "arbeitnow",
        metadata: { tags: job.tags }
      }));
    }
  };
}
