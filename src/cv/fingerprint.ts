import { createFingerprint } from "../fingerprint/create.js";
import type { CareerFingerprint } from "../fingerprint/types.js";
import type { CVProfile } from "./types.js";

export function fingerprintFromCV(profile: CVProfile): CareerFingerprint {
  return createFingerprint({
    kind: "candidate",
    title: profile.label,
    skills: profile.skills,
    tools: profile.tools,
    domains: profile.priorityDomains,
    roles: profile.targetRoles,
    remoteEligible: true,
    remoteScope: "worldwide",
    evidence: profile.evidence.map((item) => ({
      source: item.source,
      description: "Imported from CV evidence.",
      signals: item.signals
    }))
  });
}
