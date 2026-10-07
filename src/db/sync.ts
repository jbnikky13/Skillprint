import type { RankedOpportunity } from "../ranking/types.js";
import { supabase } from "./supabase.js";

export async function syncRankedJobs(items: RankedOpportunity[]) {
  if (!items.length) return { inserted: 0 };
  const rows = items.map(({ job, finalScore, rankReasons }) => ({
    external_id: job.externalId ?? job.id,
    source: job.source,
    title: job.title,
    company: job.company ?? null,
    description: job.description,
    url: job.url,
    location: job.location ?? null,
    remote: Boolean(job.remote),
    posted_at: job.postedAt ?? null,
    expires_at: job.expiresAt ?? null,
    score: finalScore,
    reasons: rankReasons
  }));
  const { error } = await supabase.from("jobs").upsert(rows, { onConflict: "source,external_id" });
  if (error) throw error;
  return { inserted: rows.length };
}
