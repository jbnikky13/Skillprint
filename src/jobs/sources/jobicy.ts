import type { JobSource, JobSearchQuery, RawJob } from "../types.js";

export function createJobicySource(): JobSource {
  return {
    id: "jobicy", name: "Jobicy", scope: "remote",
    async search(query: JobSearchQuery): Promise<RawJob[]> {
      const url = new URL("https://jobicy.com/api/v2/remote-jobs");
      if (query.keywords?.length) url.searchParams.set("count", String(Math.min(query.limit ?? 20, 50)));
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Jobicy returned HTTP ${response.status}`);
      const payload = await response.json() as { jobs?: Array<Record<string, unknown>> };
      const terms = (query.keywords ?? []).map((x) => x.toLowerCase());
      return (payload.jobs ?? []).filter((job) => {
        const haystack = [job.jobTitle, job.jobDescription, job.companyName, job.jobIndustry]
          .map((x) => String(x ?? "")).join(" ").toLowerCase();
        return !terms.length || terms.some((term) => haystack.includes(term));
      }).map((job) => ({
        externalId: job.id ? String(job.id) : undefined,
        title: String(job.jobTitle ?? ""),
        company: String(job.companyName ?? ""),
        description: String(job.jobDescription ?? ""),
        url: String(job.url ?? ""),
        location: String(job.jobGeo ?? ""),
        remote: true,
        postedAt: job.pubDate ? String(job.pubDate) : undefined,
        source: "jobicy",
        metadata: { industry: job.jobIndustry, type: job.jobType, salaryText: job.jobSalary ? String(job.jobSalary) : undefined }
      }));
    }
  };
}
