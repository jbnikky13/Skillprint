import type { JobSource, JobSearchQuery, RawJob } from "../types.js";

export function createBoqqsSource(): JobSource {
  return {
    id: "boqqs", name: "BOQQS", scope: "nigeria",
    async search(query: JobSearchQuery): Promise<RawJob[]> {
      const url = new URL("https://boqqs.com/api/v1/jobs");
      if (query.keywords?.length) url.searchParams.set("q", query.keywords.join(" "));
      if (query.locations?.length) url.searchParams.set("city", query.locations[0]);
      url.searchParams.set("country", "NG");
      if (query.limit) url.searchParams.set("limit", String(Math.min(query.limit, 50)));
      const response = await fetch(url);
      if (!response.ok) throw new Error(`BOQQS returned HTTP ${response.status}`);
      const payload = await response.json() as { jobs?: Array<Record<string, unknown>> } | Array<Record<string, unknown>>;
      const jobs = Array.isArray(payload) ? payload : (payload.jobs ?? []);
      return jobs.map((job) => ({
        externalId: job.id ? String(job.id) : undefined,
        title: String(job.title ?? ""),
        company: String(job.company ?? job.employer ?? ""),
        description: String(job.description ?? ""),
        url: String(job.url ?? job.apply_url ?? ""),
        location: String(job.city ?? job.location ?? "Nigeria"),
        remote: Boolean(job.remote),
        postedAt: job.posted_at ? String(job.posted_at) : undefined,
        source: "boqqs",
        metadata: { country: job.country, category: job.category }
      }));
    }
  };
}
