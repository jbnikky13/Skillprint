import type { NormalizedJob } from "../jobs/types.js";

export function opportunityQuality(job: NormalizedJob): number {
  let score = 0.45;
  if (job.company) score += 0.1;
  if (job.url) score += 0.1;
  if (job.description.length >= 300) score += 0.15;
  else if (job.description.length >= 120) score += 0.08;
  if (job.postedAt) score += 0.1;
  if (job.source) score += 0.1;
  return Math.round(Math.min(1, score) * 1000) / 10;
}

export function salaryQuality(job: NormalizedJob): number {
  const salary = job.salary;
  if (!salary?.min && !salary?.max) return 50;
  if (salary.min !== undefined && salary.max !== undefined && salary.max >= salary.min) return 100;
  return 75;
}

export function applicationEffort(job: NormalizedJob): number {
  const text = [job.title, job.description, String(job.metadata?.applicationSteps ?? "")].join(" ").toLowerCase();
  let score = 100;
  if (/cover letter required|portfolio required/.test(text)) score -= 10;
  if (/assessment|take-home|coding challenge/.test(text)) score -= 15;
  if (/video interview|video introduction/.test(text)) score -= 10;
  if (/1000 words|long-form questions/.test(text)) score -= 10;
  return Math.max(0, score);
}
