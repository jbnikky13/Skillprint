import { createFingerprint } from "../fingerprint/create.js";

export const benchmarkJobs = [
  createFingerprint({ kind: "job", title: "AI Data Evaluator", skills: ["AI evaluation", "data annotation"], domains: ["AI", "data"], roles: ["AI evaluator"], remoteEligible: true, remoteScope: "worldwide" }),
  createFingerprint({ kind: "job", title: "Healthcare AI Specialist", skills: ["AI", "research"], domains: ["healthcare", "AI"], roles: ["healthcare"], remoteEligible: true, remoteScope: "worldwide" }),
  createFingerprint({ kind: "job", title: "Pharmacist", skills: ["pharmacy", "healthcare"], domains: ["healthcare", "pharmaceutical"], roles: ["pharmacist"], locations: ["Nigeria"], remoteEligible: false, remoteScope: "onsite" }),
  createFingerprint({ kind: "job", title: "Automation Developer", skills: ["JavaScript", "automation"], tools: ["Next.js", "Supabase"], domains: ["automation", "software"], roles: ["automation"], remoteEligible: true, remoteScope: "worldwide" }),
  createFingerprint({ kind: "job", title: "Senior Kernel Engineer", skills: ["Rust", "Linux kernel"], domains: ["software"], roles: ["kernel engineer"], seniority: "senior", remoteEligible: true, remoteScope: "worldwide" }),
  createFingerprint({ kind: "job", title: "Marketing Manager", skills: ["marketing", "campaign management"], domains: ["marketing"], roles: ["marketing manager"], remoteEligible: true, remoteScope: "worldwide" })
];
