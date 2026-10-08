export type ApplicationEventType="application_received"|"application_viewed"|"assessment"|"interview"|"interview_scheduled"|"rejection"|"offer";
export interface ApplicationEvent{
 id:string;accountId:string;applicationId?:string;jobId?:string;eventType:ApplicationEventType;
 source:"gmail";externalId:string;subject:string;sender?:string;receivedAt:string;detectedAt:string;confidence:number;reason:string;
}
export interface ApplicationMatch{applicationId:string;jobId:string;confidence:number;reasons:string[];}
