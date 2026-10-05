import type { JobSource, JobSearchQuery, RawJob } from "../types.js";
import { createHttpJobSource } from "./http.js";

export function createNigeriaApiSource(endpoint: string, id = "nigeria-api"): JobSource {
  return createHttpJobSource({
    id, name: "Nigeria Job API", scope: "nigeria", endpoint,
    map: (payload) => Array.isArray(payload) ? payload.map((job) => ({
      externalId: job && typeof job === "object" && "id" in job ? String((job as Record<string, unknown>).id) : undefined,
      title: String((job as Record<string, unknown>).title ?? ""),
      company: String((job as Record<string, unknown>).company ?? ""),
      description: String((job as Record<string, unknown>).description ?? ""),
      url: String((job as Record<string, unknown>).url ?? ""),
      location: String((job as Record<string, unknown>).location ?? "Nigeria"),
      remote: Boolean((job as Record<string, unknown>).remote),
      source: id
    })) : []
  });
}
