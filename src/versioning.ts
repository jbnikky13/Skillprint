import { createHash } from "node:crypto";
import type { CareerFingerprint } from "./fingerprint/types.js";
export interface FingerprintVersion { id: string; version: number; createdAt: string; fingerprint: CareerFingerprint; changes: string[]; }
export function versionFingerprint(fingerprint: CareerFingerprint, previous?: FingerprintVersion): FingerprintVersion {
  const id = createHash("sha256").update(JSON.stringify(fingerprint)).digest("hex").slice(0,16);
  const changes = previous ? diffFingerprints(previous.fingerprint, fingerprint) : ["Initial fingerprint"];
  return { id, version: (previous?.version ?? 0) + 1, createdAt: new Date().toISOString(), fingerprint: { ...fingerprint, id }, changes };
}
export function diffFingerprints(a: CareerFingerprint, b: CareerFingerprint): string[] {
  const changes: string[] = [];
  for (const key of ["skills","tools","domains","roles","seniority","yearsExperience","locations","remoteEligible","remoteScope"] as const)
    if (JSON.stringify(a[key]) !== JSON.stringify(b[key])) changes.push(key);
  return changes.length ? changes : ["No material changes"];
}
