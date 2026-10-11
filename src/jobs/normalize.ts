import { createHash } from "node:crypto";
import { createFingerprint } from "../fingerprint/create.js";
import type { NormalizedJob, RawJob } from "./types.js";
const ROLE_HINTS=["software-developer","software-engineer","developer","ai-evaluator","data-annotator","data-analyst","pharmacist","automation","research","product-operations"];
const DOMAIN_HINTS=["ai","data","healthcare","pharmaceutical","pharma","software","automation","web3","blockchain"];
const TOOL_HINTS=["python","javascript","typescript","sql","react","nextjs","supabase","vercel","github","api","excel"];
function detect(text:string, hints:string[]){const lower=text.toLowerCase();return hints.filter(x=>lower.includes(x.replace("-", " ")));}

/** Convert provider dates to ISO timestamps. Some APIs send Unix seconds as numeric strings. */
export function normalizeDate(value: unknown): string | undefined {
  if (value === null || value === undefined || value === "") return undefined;
  const input = String(value).trim();
  if (!input) return undefined;

  let milliseconds: number;
  if (/^\d{9,13}$/.test(input)) {
    const numeric = Number(input);
    milliseconds = input.length <= 10 ? numeric * 1000 : numeric;
  } else {
    milliseconds = Date.parse(input);
  }

  if (!Number.isFinite(milliseconds)) return undefined;
  const date = new Date(milliseconds);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

export function normalizeJob(raw:RawJob):NormalizedJob {
  const postedAt = normalizeDate(raw.postedAt);
  const expiresAt = normalizeDate(raw.expiresAt);
  const normalizedRaw = { ...raw, postedAt, expiresAt };
  const text=[raw.title,raw.description,raw.company,raw.location].filter(Boolean).join(" ");
  const roles=detect(text,ROLE_HINTS), domains=detect(text,DOMAIN_HINTS), tools=detect(text,TOOL_HINTS);
  const remote=raw.remote ?? /\b(remote|work from home|worldwide|distributed)\b/i.test(text);
  const scope=remote ? (/\b(worldwide|global|anywhere)\b/i.test(text) ? "worldwide" : "unknown") : "onsite";
  const fingerprint=createFingerprint({
    kind:"job", title:raw.title, roles, domains, tools,
    skills:[...new Set([...roles,...domains,...tools])],
    locations:raw.location ? [raw.location] : [], remoteEligible:remote,
    remoteScope:scope as "worldwide"|"country"|"region"|"hybrid"|"onsite"|"unknown",
    salary:raw.salary
  });
  const id=createHash("sha256").update([raw.source,raw.externalId ?? raw.url,raw.title,raw.company ?? ""].join("|")).digest("hex").slice(0,16);
  return {...normalizedRaw,id,fingerprint,discoveredAt:new Date().toISOString(),status:isExpired(expiresAt)?"expired":"active"};
}
function isExpired(expiresAt?:string){if(expiresAt)return Date.parse(expiresAt)<Date.now();return false;}
