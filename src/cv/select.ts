import type { CareerFingerprint } from "../fingerprint/types.js";
import type { CVProfile, CVSelection } from "./types.js";

function overlap(values: string[] = [], target: string[] = []): number {
  const a = new Set((Array.isArray(values) ? values : []).map((v) => v.toLowerCase()));
  if (!target.length) return 1;
  return target.filter((v) => a.has(v.toLowerCase())).length / target.length;
}

export function selectBestCV(job: CareerFingerprint, cvs: CVProfile[]): CVSelection[] {
  const roles = Array.isArray(job?.roles) ? job.roles.map((x) => x.name) : [];
  const domains = Array.isArray(job?.domains) ? job.domains.map((x) => x.name) : [];
  const skillsList = Array.isArray(job?.skills) ? job.skills.map((x) => x.name) : [];
  const toolsList = Array.isArray(job?.tools) ? job.tools.map((x) => x.name) : [];
  return (Array.isArray(cvs) ? cvs : []).map((cv) => {
    const role = overlap(cv.targetRoles, roles);
    const domain = overlap(cv.priorityDomains, domains);
    const skills = overlap(cv.skills, skillsList);
    const tools = overlap(cv.tools, toolsList);
    const score = Math.round((role * 0.35 + domain * 0.3 + skills * 0.25 + tools * 0.1) * 1000) / 10;
    const reasons = [
      role ? "Role focus matches the opportunity." : "Role focus is weak.",
      domain ? "Domain focus matches the opportunity." : "Domain focus is weak.",
      skills ? "Relevant skills are represented." : "Few directly matching skills.",
      tools ? "Relevant tools are represented." : "Few matching tools."
    ];
    return { cvId: cv.id, score, reasons };
  }).sort((a, b) => b.score - a.score);
}
