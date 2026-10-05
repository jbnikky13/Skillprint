import type { JobSource, JobSearchQuery, RawJob } from "../types.js";
export function createRemotiveSource(): JobSource {
  return {
    id: "remotive", name: "Remotive", scope: "remote",
    async search(query: JobSearchQuery): Promise<RawJob[]> {
      const url = new URL("https://remotive.com/api/remote-jobs");
      if (query.keywords?.length) url.searchParams.set("search", query.keywords.join(" "));
      if (query.limit) url.searchParams.set("limit", String(query.limit));
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Remotive returned HTTP ${response.status}`);
      const payload = await response.json() as { jobs?: Array<Record<string, unknown>> };
      return (payload.jobs ?? []).map((job) => ({
        externalId: String(job.id),
        title: String(job.title ?? ""),
        company: String(job.company_name ?? ""),
        description: String(job.description ?? ""),
        url: String(job.url ?? ""),
        location: String(job.candidate_required_location ?? ""),
        remote: true,
        postedAt: job.publication_date ? String(job.publication_date) : undefined,
        salary: job.salary ? { text: String(job.salary) } : undefined,
        source: "remotive",
        metadata: { category: job.category, jobType: job.job_type }
      }));
    }
  };
}
