import { createHash } from "node:crypto";
import { createFingerprint } from "../fingerprint/create.js";
import type { NormalizedJob, RawJob } from "./types.js";
const ROLE_HINTS=["software-developer","software-engineer","developer","ai-evaluator","data-annotator","data-analyst","pharmacist","automation","research","product-operations"];
const DOMAIN_HINTS=["ai","data","healthcare","pharmaceutical","pharma","software","automation","web3","blockchain"];
const TOOL_HINTS=["python","javascript","typescript","sql","react","nextjs","supabase","vercel","github","api","excel"];
function detect(text:string, hints:string[]){const lower=text.toLowerCase();return hints.filter(x=>lower.includes(x.replace("-", " ")));}

export function normalizeJob(raw:RawJob):NormalizedJob {
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
  return {...raw,id,fingerprint,discoveredAt:new Date().toISOString(),status:isExpired(raw)?"expired":"active"};
}
function isExpired(raw:RawJob){if(raw.expiresAt)return Date.parse(raw.expiresAt)<Date.now();return false;}
