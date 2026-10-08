import type {GmailMessage,GmailStatus} from "../product/gmail.js";
import type {ApplicationRecord,OpportunityRecord} from "../command-center/types.js";
import type {ApplicationEvent,ApplicationMatch} from "./types.js";
import type {CareerCommandCenter} from "../command-center/store.js";

const norm=(s="")=>s.toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
const words=(s="")=>new Set(norm(s).split(/\s+/).filter(x=>x.length>2));
const overlap=(a:string,b:string)=>{const A=words(a),B=words(b);if(!A.size||!B.size)return 0;let n=0;for(const x of A)if(B.has(x))n++;return n/Math.max(1,Math.min(A.size,B.size));};

export function matchApplication(message:GmailMessage,applications:ApplicationRecord[],opportunities:OpportunityRecord[]):ApplicationMatch|undefined{
 const subject=message.headers.subject??"";const sender=message.headers.from??"";const body=message.bodyText??"";
 let best:ApplicationMatch|undefined;
 for(const app of applications){
  const job=opportunities.find(o=>o.id===app.jobId);if(!job)continue;
  const title=job.job.title??"";const company=(job.job as any).company??(job.job as any).companyName??"";
  const a=overlap(subject,title),b=overlap(body,title),c=overlap(sender,company),d=overlap(body,company);
  const confidence=Math.min(0.99,0.15+a*0.35+b*0.2+c*0.2+d*0.1);
  const reasons:string[]=[];if(a>.3)reasons.push("subject matches job title");if(c>.3)reasons.push("sender matches company");if(b>.3)reasons.push("body matches job title");if(d>.3)reasons.push("body matches company");
  if(!best||confidence>best.confidence)best={applicationId:app.id,jobId:app.jobId,confidence,reasons};
 }
 return best&&best.confidence>=.5?best:undefined;
}
const mapState=(s:GmailStatus):ApplicationEvent["eventType"]=>s==="application_received"?"application_received":s==="application_viewed"?"application_viewed":s==="assessment"?"assessment":s==="interview"?"interview":s==="interview_scheduled"?"interview_scheduled":s==="rejection"?"rejection":"offer";
export function processGmailEvent(accountId:string,message:GmailMessage,status:GmailStatus,center:CareerCommandCenter):ApplicationEvent|undefined{
 if(status==="unknown")return;
 const snapshot=center.snapshot();const match=matchApplication(message,snapshot.applications,snapshot.opportunities);if(!match)return;
 const eventType=mapState(status);const existing=snapshot.messages.find(m=>m.externalId===message.id);if(existing)return;
 const receivedAt=message.headers.date?new Date(message.headers.date).toISOString():(message.internalDate?new Date(Number(message.internalDate)).toISOString():new Date().toISOString());
 const event:ApplicationEvent={id:"evt-"+message.id,accountId,applicationId:match.applicationId,jobId:match.jobId,eventType,source:"gmail",externalId:message.id,subject:message.headers.subject??"",sender:message.headers.from,receivedAt,detectedAt:new Date().toISOString(),confidence:match.confidence,reason:match.reasons.join("; ")||"job/application match"};
 center.ingestMessage({receivedAt,sender:message.headers.from,subject:message.headers.subject,body:message.bodyText??message.snippet??"",kind:eventType==="interview"||eventType==="interview_scheduled"?"interview":eventType==="offer"?"offer":eventType==="rejection"?"rejection":"application_status",jobId:match.jobId,externalId:message.id});
 const app=snapshot.applications.find(a=>a.id===match.applicationId);
 if(app){if(eventType==="rejection")center.ingestMessage({receivedAt,sender:message.headers.from,subject:message.headers.subject,body:"Gmail rejection detected: "+event.reason,kind:"rejection",jobId:match.jobId,externalId:message.id});else if(eventType==="offer")center.updateApplication(app.id,"submitted","Gmail offer detected");}
 if(eventType==="interview"||eventType==="interview_scheduled")center.notify({type:"interview",title:"Interview detected",message:event.subject,jobId:match.jobId});
 else if(eventType==="offer")center.notify({type:"offer",title:"Offer detected",message:event.subject,jobId:match.jobId});
 else if(eventType==="rejection")center.notify({type:"application",title:"Application update",message:event.subject,jobId:match.jobId});
 return event;
}
