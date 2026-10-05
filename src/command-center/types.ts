import type { NormalizedJob } from "../jobs/types.js";
import type { RankedOpportunity } from "../ranking/types.js";
import type { ApplicationTask, ApplicationState } from "../agent/types.js";

export type PipelineStage = "discovered"|"saved"|"queued"|"applied"|"interview"|"offer"|"rejected"|"archived";
export type InterviewStatus = "scheduled"|"completed"|"cancelled"|"no_show";
export type OfferStatus = "received"|"accepted"|"declined"|"expired";

export interface OpportunityRecord {
  id:string; job:NormalizedJob; ranked?:RankedOpportunity; stage:PipelineStage;
  savedAt?:string; notes?:string; updatedAt:string;
}
export interface ApplicationRecord {
  id:string; jobId:string; taskId?:string; state:ApplicationState;
  appliedAt?:string; lastStatusAt:string; source?:string; notes?:string;
}
export interface InterviewRecord {
  id:string; jobId:string; scheduledAt:string; status:InterviewStatus;
  round?:string; notes?:string; updatedAt:string;
}
export interface OfferRecord {
  id:string; jobId:string; status:OfferStatus; receivedAt:string;
  expiresAt?:string; compensation?:string; notes?:string; updatedAt:string;
}
export type CommunicationKind = "application_status"|"interview"|"recruiter"|"rejection"|"offer"|"other";
export interface StatusMessage {
  id:string; receivedAt:string; sender?:string; subject?:string;
  body:string; kind:CommunicationKind; jobId?:string; externalId?:string;
}
export interface Notification {
  id:string; type:"job_match"|"application"|"interview"|"offer"|"system";
  title:string; message:string; createdAt:string; read:boolean; jobId?:string;
}
export interface CommandCenterSnapshot {
  opportunities:OpportunityRecord[];
  applications:ApplicationRecord[];
  interviews:InterviewRecord[];
  offers:OfferRecord[];
  messages:StatusMessage[];
  notifications:Notification[];
}
export interface CommandCenterAnalytics {
  activeOpportunities:number; saved:number; applications:number; interviews:number;
  offers:number; responseRate:number; interviewRate:number; offerRate:number;
  averageMatchScore:number; pendingApplications:number;
}
