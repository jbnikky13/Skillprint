import type { CareerCommandCenter } from "./store.js";
import type { CommunicationKind } from "./types.js";
export function ingestStatusEmail(center:CareerCommandCenter,input:{sender?:string;subject?:string;body:string;jobId?:string;externalId?:string}){
 const text=(input.subject??"")+" "+input.body; const lower=text.toLowerCase();
 let kind:CommunicationKind="other";
 if(/interview|screening|schedule/.test(lower))kind="interview";
 else if(/offer|compensation|salary package/.test(lower))kind="offer";
 else if(/rejected|regret|not moving forward/.test(lower))kind="rejection";
 else if(/application|received|submitted|under review/.test(lower))kind="application_status";
 else if(/recruiter|hiring manager/.test(lower))kind="recruiter";
 return center.ingestMessage({...input,receivedAt:new Date().toISOString(),kind});
}
