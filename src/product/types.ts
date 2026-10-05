export type UserRole="candidate"|"recruiter"|"company"|"admin";
export interface Account{id:string;email:string;role:UserRole;createdAt:string;status:"active"|"suspended"|"deleted";}
export interface PrivacySettings{profileVisibility:"private"|"matched_recruiters"|"public";allowRecruiterDiscovery:boolean;allowModelImprovement:boolean;shareContactAfterMatch:boolean;dataRetentionDays:number;}
export type PlanId="free"|"pro"|"team"|"enterprise";
export interface Plan{ id:PlanId; name:string; monthlyPriceUsd:number; monthlyApplicationLimit:number; apiAccess:boolean; recruiterMode:boolean; }
export interface Subscription{accountId:string;planId:PlanId;status:"trialing"|"active"|"past_due"|"cancelled";currentPeriodEnd?:string;providerCustomerId?:string;}
export interface APIKey{id:string;accountId:string;label:string;prefix:string;createdAt:string;revokedAt?:string;}
export interface RecruiterSearch{query:string;skills?:string[];roles?:string[];remote?:boolean;location?:string;limit?:number;}
export interface CandidateCard{candidateId:string;headline:string;skills:string[];roles:string[];domains:string[];remoteEligible:boolean;matchScore?:number;}
export interface RecruiterPermission{canViewProfile:boolean;canViewEvidence:boolean;canContact:boolean;}
