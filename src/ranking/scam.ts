import type { NormalizedJob } from "../jobs/types.js";

const RED_FLAGS = [
  /pay (a )?(fee|deposit|money)/i,
  /buy (equipment|training|starter kit)/i,
  /guaranteed (income|job|salary)/i,
  /wire (money|funds)/i,
  /crypto (payment|wallet) required/i,
  /send (your )?(password|private key|seed phrase)/i,
  /whatsapp only/i,
  /telegram only/i
];

export function scamRisk(job: NormalizedJob): number {
  const text = [job.title, job.company ?? "", job.description].join(" ");
  const hits = RED_FLAGS.filter((pattern) => pattern.test(text)).length;
  const missingIdentity = !job.company || !job.url;
  const risk = Math.min(100, hits * 25 + (missingIdentity ? 15 : 0));
  return risk;
}

export function scamSafetyScore(job: NormalizedJob): number {
  return 100 - scamRisk(job);
}
