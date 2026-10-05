import type { JobSource, JobSearchQuery, RawJob } from "../types.js";
export function createRemoteJobsSource(): JobSource {
  return {
    id: "remotejobs.org", name: "RemoteJobs.org", scope: "remote",
    async search(query: JobSearchQuery): Promise<RawJob[]> {
      const url = new URL("https://remotejobs.org/api/v1/jobs");
      url.searchParams.set("limit", String(Math.min(query.limit ?? 20, 50)));
      if (query.keywords?.length) url.searchParams.set("q", query.keywords.join(" "));
      const response = await fetch(url);
      if (!response.ok) throw new Error(`RemoteJobs.org returned HTTP ${response.status}`);
      const payload = await response.json() as { data?: Array<Record<string, unknown>> };
      return (payload.data ?? []).map((job) => {
        const company = job.company as Record<string, unknown> | undefined;
        return {
          externalId: job.id ? String(job.id) : undefined,
          title: String(job.title ?? ""),
          company: company?.name ? String(company.name) : undefined,
          description: String(job.description ?? ""),
          url: String(job.apply_url ?? job.url ?? ""),
          location: String(job.location ?? ""),
          remote: true,
          postedAt: job.posted_at ? String(job.posted_at) : undefined,
          salary: job.salary_text ? { text: String(job.salary_text) } : undefined,
          source: "remotejobs.org",
          metadata: { category: (job.category as Record<string, unknown> | undefined)?.slug, type: job.type }
        };
      });
    }
  };
}
