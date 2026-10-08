import type { ApplicationTask } from "../agent/types.js";
import type { RankedOpportunity } from "../ranking/types.js";
import type { CommandCenterSnapshot, OpportunityRecord, ApplicationRecord, InterviewRecord, OfferRecord, StatusMessage, Notification } from "./types.js";

const now=()=>new Date().toISOString();
const id=(prefix:string)=>prefix+"-"+Date.now()+"-"+Math.random().toString(36).slice(2,8);

export class CareerCommandCenter {
  private data:CommandCenterSnapshot={opportunities:[],applications:[],interviews:[],offers:[],messages:[],notifications:[]};
  constructor(snapshot?:CommandCenterSnapshot){if(snapshot)this.data=structuredClone(snapshot);}

  ingest(opportunities:RankedOpportunity[]):OpportunityRecord[]{
    return opportunities.map(r=>{const existing=this.data.opportunities.find(x=>x.id===r.job.id);
      if(existing){existing.ranked=r;existing.updatedAt=now();return existing;}
      const record:OpportunityRecord={id:r.job.id,job:r.job,ranked:r,stage:"discovered",updatedAt:now()};
      this.data.opportunities.push(record); return record;
    });
  }
  saveJob(jobId:string,notes?:string):OpportunityRecord{
    const record=this.requireJob(jobId); record.stage="saved"; record.savedAt=now(); record.notes=notes??record.notes; record.updatedAt=now(); return record;
  }
  queueJob(jobId:string):OpportunityRecord{const r=this.requireJob(jobId);r.stage="queued";r.updatedAt=now();return r;}
  recordApplication(task:ApplicationTask):ApplicationRecord{
    const record:ApplicationRecord={id:id("app"),jobId:task.job.id,taskId:task.id,state:task.state,lastStatusAt:now()};
    this.data.applications.push(record); const job=this.requireJob(task.job.id); job.stage=task.state==="submitted"?"applied":"queued"; job.updatedAt=now(); return record;
  }
  findApplicationById(id:string){return this.data.applications.find(x=>x.id===id);}
  updateApplication(id:string,state:ApplicationRecord["state"],notes?:string):ApplicationRecord{
    const r=this.data.applications.find(x=>x.id===id);if(!r)throw new Error("Application not found");r.state=state;r.lastStatusAt=now();r.notes=notes??r.notes;if(state==="submitted")r.appliedAt=r.appliedAt??now();return r;
  }
  addInterview(input:Omit<InterviewRecord,"id"|"updatedAt">):InterviewRecord{const r={...input,id:id("int"),updatedAt:now()};this.data.interviews.push(r);this.requireJob(input.jobId).stage="interview";return r;}
  addOffer(input:Omit<OfferRecord,"id"|"updatedAt">):OfferRecord{const r={...input,id:id("offer"),updatedAt:now()};this.data.offers.push(r);this.requireJob(input.jobId).stage="offer";return r;}
  ingestMessage(message:Omit<StatusMessage,"id">):StatusMessage{const existing=message.externalId?this.data.messages.find(x=>x.externalId===message.externalId):undefined;if(existing)return existing;const r={...message,id:id("msg")};this.data.messages.push(r);return r;}
  notify(input:Omit<Notification,"id"|"createdAt"|"read">):Notification{const r={...input,id:id("note"),createdAt:now(),read:false};this.data.notifications.push(r);return r;}
  markNotificationRead(id:string):void{const n=this.data.notifications.find(x=>x.id===id);if(n)n.read=true;}
  analytics():import("./types.js").CommandCenterAnalytics{
    const applications=this.data.applications.length, interviews=this.data.interviews.length, offers=this.data.offers.length;
    const applied=this.data.applications.filter(a=>a.appliedAt||a.state==="submitted").length;
    const responded=this.data.messages.filter(m=>m.kind==="application_status"||m.kind==="interview"||m.kind==="rejection"||m.kind==="offer").length;
    const scores=this.data.opportunities.map(o=>o.ranked?.finalScore).filter((x):x is number=>typeof x==="number");
    return {activeOpportunities:this.data.opportunities.filter(o=>!["archived","rejected"].includes(o.stage)).length,saved:this.data.opportunities.filter(o=>o.stage==="saved").length,applications,interviews,offers,responseRate:applications?Math.min(1,responded/applications):0,interviewRate:applied?Math.min(1,interviews/applied):0,offerRate:applied?Math.min(1,offers/applied):0,averageMatchScore:scores.length?scores.reduce((a,b)=>a+b,0)/scores.length:0,pendingApplications:this.data.applications.filter(a=>["queued","ready","approved"].includes(a.state)).length};
  }
  unreadNotifications(){return this.data.notifications.filter(n=>!n.read).map(n=>structuredClone(n));}
  notificationSummary(){const unread=this.unreadNotifications();return {unreadCount:unread.length,byType:unread.reduce((a,n)=>(a[n.type]=(a[n.type]??0)+1,a),{} as Record<string,number>),latest:unread.sort((a,b)=>b.createdAt.localeCompare(a.createdAt)).slice(0,10)};}
  snapshot():CommandCenterSnapshot{return structuredClone(this.data);}
  private requireJob(jobId:string){const r=this.data.opportunities.find(x=>x.id===jobId);if(!r)throw new Error("Opportunity not found: "+jobId);return r;}
}
