import type { JobSource, JobSearchQuery, RawJob } from "../types.js";

export function createHimalayasSource(): JobSource {
  return {
    id: "himalayas", name: "Himalayas", scope: "remote",
    async search(query: JobSearchQuery): Promise<RawJob[]> {
      const url = new URL("https://himalayas.app/jobs/api");
      url.searchParams.set("limit", String(Math.min(query.limit ?? 20, 20)));
      if (query.keywords?.length) url.searchParams.set("q", query.keywords.join(" "));
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Himalayas returned HTTP ${response.status}`);
      const payload = await response.json() as { jobs?: Array<Record<string, unknown>> };
      return (payload.jobs ?? []).map((job) => ({
        externalId: job.id ? String(job.id) : undefined,
        title: String(job.title ?? ""),
        company: job.companyName ? String(job.companyName) : undefined,
        description: String(job.description ?? ""),
        url: String(job.applicationLink ?? job.url ?? ""),
        location: String(job.locationRestrictions ?? job.location ?? "Remote"),
        remote: true,
        postedAt: job.pubDate ? String(job.pubDate) : undefined,
        source: "himalayas",
        metadata: { categories: job.categories, seniority: job.seniority, salary: job.salary }
      }));
    }
  };
}
