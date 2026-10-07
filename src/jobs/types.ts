import type { CareerFingerprint } from "../fingerprint/types.js";

export interface JobSource {
  id: string;
  name: string;
  scope: "global" | "remote" | "nigeria" | "local";
  search(query: JobSearchQuery): Promise<RawJob[]>;
}
export interface JobSearchQuery {
  keywords?: string[];
  locations?: string[];
  remoteOnly?: boolean;
  limit?: number;
}
export interface RawJob {
  externalId?: string;
  title: string;
  company?: string;
  description: string;
  url: string;
  location?: string;
  remote?: boolean;
  postedAt?: string;
  expiresAt?: string;
  salary?: CareerFingerprint["salary"];
  source: string;
  metadata?: Record<string, unknown>;
}
export interface NormalizedJob extends RawJob {
  id: string;
  fingerprint: CareerFingerprint;
  discoveredAt: string;
  status: "active" | "expired" | "unknown";
  /** Latest computed match/ranking score when a job has been ranked for a candidate. */
  matchScore?: number;
}
