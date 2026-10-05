import type { JobSource, JobSearchQuery, RawJob } from "../types.js";

function objects(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) return value.flatMap(objects);
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    return obj["@graph"] ? objects(obj["@graph"]) : [obj];
  }
  return [];
}

function parseJobPosting(node: Record<string, unknown>, pageUrl: string): RawJob | undefined {
  if (node["@type"] !== "JobPosting" || !node.title) return undefined;
  const company = node.hiringOrganization && typeof node.hiringOrganization === "object"
    ? String((node.hiringOrganization as Record<string, unknown>).name ?? "")
    : undefined;
  const location = node.jobLocation && typeof node.jobLocation === "object"
    ? JSON.stringify(node.jobLocation)
    : String(node.jobLocationType ?? "");
  return {
    externalId: node.identifier && typeof node.identifier === "object"
      ? String((node.identifier as Record<string, unknown>).value ?? "")
      : undefined,
    title: String(node.title),
    company,
    description: String(node.description ?? ""),
    url: String(node.url ?? pageUrl),
    location,
    remote: String(node.jobLocationType ?? "").toUpperCase().includes("TELECOMMUTE"),
    postedAt: node.datePosted ? String(node.datePosted) : undefined,
    expiresAt: node.validThrough ? String(node.validThrough) : undefined,
    source: new URL(pageUrl).hostname,
    metadata: { employmentType: node.employmentType, industry: node.industry }
  };
}

export function parseJobPostingJsonLd(html: string, pageUrl: string): RawJob[] {
  const jobs: RawJob[] = [];
  const pattern = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  for (const match of html.matchAll(pattern)) {
    try {
      const data = JSON.parse(match[1].trim()) as unknown;
      for (const node of objects(data)) {
        const job = parseJobPosting(node, pageUrl);
        if (job) jobs.push(job);
      }
    } catch { /* ignore malformed JSON-LD blocks */ }
  }
  return jobs;
}

export function createJsonLdCareerSource(id: string, name: string, careersUrl: string): JobSource {
  return {
    id, name, scope: "global",
    async search(query: JobSearchQuery): Promise<RawJob[]> {
      const response = await fetch(careersUrl);
      if (!response.ok) throw new Error(`${name} returned HTTP ${response.status}`);
      const jobs = parseJobPostingJsonLd(await response.text(), careersUrl);
      const terms = (query.keywords ?? []).map((term) => term.toLowerCase());
      const locations = (query.locations ?? []).map((location) => location.toLowerCase());
      return jobs.filter((job) => {
        const haystack = `${job.title} ${job.description} ${job.company ?? ""}`.toLowerCase();
        const keywordMatch = !terms.length || terms.some((term) => haystack.includes(term));
        const locationMatch = !locations.length || locations.some((location) => (job.location ?? "").toLowerCase().includes(location));
        return keywordMatch && locationMatch;
      });
    }
  };
}
