import { createFingerprint, matchFingerprints } from "./index.js";

const candidate = createFingerprint({
  kind: "candidate",
  title: "Pharmacist • AI/Data Annotation • Builder",
  skills: ["pharmacy", "AI", "data annotation", "JavaScript", "TypeScript", "automation"],
  tools: ["Next.js", "Supabase", "GitHub", "Vercel"],
  domains: ["healthcare", "healthtech", "AI", "automation"],
  roles: ["pharmacist", "AI evaluator", "data annotator", "automation"],
  locations: ["Nigeria"],
  remoteEligible: true,
  remoteScope: "worldwide",
  evidence: [
    { source: "portfolio", description: "Built AI, healthcare and automation products.", signals: ["ai", "healthcare", "automation"] },
    { source: "professional", description: "Licensed pharmacist.", signals: ["pharmacy", "healthcare"] }
  ]
});

const jobs = [
  createFingerprint({
    kind: "job",
    title: "Remote Healthcare AI Evaluator",
    skills: ["AI", "data annotation"],
    tools: ["JavaScript"],
    domains: ["healthcare", "AI"],
    roles: ["AI evaluator"],
    remoteEligible: true,
    remoteScope: "worldwide"
  }),
  createFingerprint({
    kind: "job",
    title: "Pharmacist — Port Harcourt",
    skills: ["pharmacy"],
    domains: ["healthcare"],
    roles: ["pharmacist"],
    locations: ["Nigeria"],
    remoteEligible: false,
    remoteScope: "onsite"
  })
];

for (const job of jobs) {
  console.log(job.title, matchFingerprints(candidate, job));
}
