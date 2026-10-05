import type { ApplicationPackage } from "../application/types.js";
import type { NormalizedJob } from "../jobs/types.js";

export type AgentMode = "manual" | "approval" | "autonomous";
export type ApplicationState = "queued" | "ready" | "awaiting_approval" | "approved" | "submitted" | "failed" | "blocked";

export interface ApplicationTask {
  id: string;
  job: NormalizedJob;
  package: ApplicationPackage;
  mode: AgentMode;
  state: ApplicationState;
  createdAt: string;
  attempts: number;
}

export interface ApplicationSubmission {
  accepted: boolean;
  externalId?: string;
  message?: string;
}

export interface ApplicationBrowser {
  open(url: string): Promise<void>;
  fill(field: string, value: string): Promise<void>;
  upload(field: string, filePath: string): Promise<void>;
  click(selector: string): Promise<void>;
  submit(): Promise<void>;
}

export interface ApplicationWorkflow {
  name: string;
  canHandle(job: NormalizedJob): boolean;
  run(task: ApplicationTask, browser: ApplicationBrowser): Promise<ApplicationSubmission>;
}

export interface AgentPolicy {
  maxApplicationsPerRun: number;
  minMatchScore: number;
  minTruthConfidence: number;
  allowedModes: AgentMode[];
  requireApprovalForUnknownSites: boolean;
  respectJobExpiration: boolean;
}
