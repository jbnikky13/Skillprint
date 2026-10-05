import { createHash } from "node:crypto";
import { normalizeSignals } from "../fingerprint/normalize.js";
import type { PortfolioProfile, PortfolioProject } from "./types.js";

const TECH = ["javascript","typescript","python","nextjs","react","supabase","vercel","github","api","automation","ai","web3","blockchain","sql"];
const DOMAINS = ["healthcare","healthtech","pharmaceutical","ai","data","software","automation","web3","blockchain"];
const ROLES = ["software-developer","automation","ai-evaluator","data-annotator","research","product-operations","pharmacist"];

function detect(text: string, vocabulary: string[]) {
  const lower = text.toLowerCase();
  return normalizeSignals(vocabulary.filter((x) => lower.includes(x.replace("-", " "))));
}
export function ingestPortfolioText(text: string, sourceUrl?: string): PortfolioProfile {
  const blocks = text.split(/\n\s*\n/).map((x) => x.trim()).filter(Boolean);
  const projects: PortfolioProject[] = blocks.map((block, i) => {
    const lines = block.split("\n").map((x) => x.trim()).filter(Boolean);
    const title = lines[0] ?? `Project ${i + 1}`;
    const description = lines.slice(1).join(" ");
    const technologies = detect(block, TECH);
    const domains = detect(block, DOMAINS);
    const roles = detect(block, ROLES);
    return {
      id: createHash("sha256").update(block).digest("hex").slice(0, 12),
      title, description, url: sourceUrl, technologies, domains, roles,
      evidence: [{ source: sourceUrl ?? "portfolio", signals: [...technologies, ...domains, ...roles] }]
    };
  });
  return { sourceUrl, projects };
}
