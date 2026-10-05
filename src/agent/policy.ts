import type { ApplicationTask } from "./types.js";
import type { AgentPolicy } from "./types.js";

export const DEFAULT_AGENT_POLICY: AgentPolicy = {
  maxApplicationsPerRun: 10,
  minMatchScore: 70,
  minTruthConfidence: 0.75,
  allowedModes: ["manual", "approval"],
  requireApprovalForUnknownSites: true,
  respectJobExpiration: true
};

export function evaluatePolicy(task: ApplicationTask, policy: AgentPolicy = DEFAULT_AGENT_POLICY): { allowed: boolean; reasons: string[] } {
  const reasons: string[] = [];
  if (!policy.allowedModes.includes(task.mode)) reasons.push("Agent mode is disabled by policy.");
  if (task.package.job.status === "expired" && policy.respectJobExpiration) reasons.push("Job is expired.");
  if (task.package.truthReport.valid === false) reasons.push("Application contains unsupported or contradictory claims.");
  const score = task.package.job.fingerprint ? task.package.job.fingerprint.version : 0;
  if (score < 1) reasons.push("Job fingerprint is invalid.");
  return { allowed: reasons.length === 0, reasons };
}
