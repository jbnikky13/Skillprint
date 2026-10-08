import { dashboardView } from "./dashboard.js";
import type { CareerCommandCenter } from "../command-center/store.js";
import type { AuthProvider } from "./auth.js";
import { createGmailAuthorizationUrl, createGmailState, exchangeGmailCode, gmailProfile, verifyGmailState, refreshGmailAccessToken, listGmailMessages, getGmailMessage, classifyGmailMessage } from "./gmail.js";
import type { GmailConnectionRepository } from "./gmail-repository.js";

export interface HTTPRequest { method:string; path:string; headers?:Record<string,string|undefined>; body?:unknown; }
export interface HTTPResponse { status:number; headers:Record<string,string>; body:string; }

const json=(status:number,value:unknown):HTTPResponse=>({status,headers:{"content-type":"application/json","cache-control":"no-store"},body:JSON.stringify(value)});

export async function handleProductRequest(
 req:HTTPRequest,
 deps:{auth:AuthProvider; center:(accountId:string, identity?:{accountId:string;email:string;role:"candidate"|"recruiter"|"company"|"admin"})=>Promise<CareerCommandCenter>; gmail?:GmailConnectionRepository}
):Promise<HTTPResponse>{
 if(req.method==="GET"&&req.path==="/health")return json(200,{ok:true,service:"skillprint"});
 if(req.method==="GET"&&req.path==="/api/dashboard"){
   const token=req.headers?.authorization?.replace(/^Bearer\s+/i,"");
   if(!token)return json(401,{error:"Authentication required"});
   const identity=await deps.auth.verify(token);
   if(!identity)return json(401,{error:"Invalid session"});
   return json(200,dashboardView(await deps.center(identity.accountId,identity)));
 }
 if(req.method==="GET"&&req.path==="/api/gmail/connect"){
   const token=req.headers?.authorization?.replace(/^Bearer\s+/i,"");if(!token)return json(401,{error:"Authentication required"});
   const identity=await deps.auth.verify(token);if(!identity)return json(401,{error:"Invalid session"});
   if(!deps.gmail)return json(503,{error:"Gmail integration is not configured"});
   try{return json(200,{authorizationUrl:createGmailAuthorizationUrl(createGmailState(identity.accountId))})}catch(e){return json(503,{error:e instanceof Error?e.message:"Gmail OAuth is not configured"})}
 }
 if(req.method==="GET"&&req.path==="/api/gmail/callback"){return json(400,{error:"Use the OAuth callback handler with query parameters"})}
 if(req.method==="POST"&&req.path==="/api/gmail/sync"){
   const token=req.headers?.authorization?.replace(/^Bearer\s+/i,"");if(!token)return json(401,{error:"Authentication required"});
   const identity=await deps.auth.verify(token);if(!identity||!deps.gmail)return json(401,{error:"Invalid session"});
   let c=await deps.gmail.get(identity.accountId);if(!c||!c.accessToken)return json(409,{error:"Gmail is not connected"});
   try{
     if(c.tokenExpiresAt&&new Date(c.tokenExpiresAt).getTime()<Date.now()+60000&&c.refreshToken){const fresh=await refreshGmailAccessToken(c.refreshToken);c.accessToken=fresh.accessToken;c.tokenExpiresAt=fresh.expiresAt;await deps.gmail.save(c);}
     const listed=await listGmailMessages(c.accessToken,"newer_than:30d (application OR interview OR assessment OR offer OR rejection)",50);
     const messages=[];const events=[];const center=await deps.center(identity.accountId,identity);
const {processGmailEvent}=await import("../application-events/engine.js");
for(const item of listed.messages??[]){const msg=await getGmailMessage(c.accessToken,item.id);const status=classifyGmailMessage(msg);if(status!=="unknown"){messages.push({id:msg.id,threadId:msg.threadId,status,subject:msg.headers.subject??"",from:msg.headers.from??"",date:msg.headers.date??"",snippet:msg.snippet??""});const event=processGmailEvent(identity.accountId,msg,status,center);if(event)events.push(event);}}
const snapshot=center.snapshot();
     const profile=await gmailProfile(c.accessToken);c.email=profile.emailAddress;c.googleSub=profile.emailAddress;c.historyId=profile.historyId;c.lastSyncAt=new Date().toISOString();c.status="connected";await deps.gmail.save(c);
     await deps.center(identity.accountId,identity);
return json(200,{email:c.email,scanned:listed.messages?.length??0,classified:messages.length,events,syncedAt:c.lastSyncAt});
   }catch(e){c.status="error";await deps.gmail.save(c);return json(502,{error:e instanceof Error?e.message:"Gmail sync failed"})}
 }
 if(req.method==="GET"&&req.path==="/api/career/analytics"){
   const token=req.headers?.authorization?.replace(/^Bearer\s+/i,"");if(!token)return json(401,{error:"Authentication required"});
   const identity=await deps.auth.verify(token);if(!identity)return json(401,{error:"Invalid session"});
   const center=await deps.center(identity.accountId,identity);return json(200,{analytics:center.analytics(),notifications:center.notificationSummary()});
 }
 if(req.method==="POST"&&req.path==="/api/career/notifications/read"){
   const token=req.headers?.authorization?.replace(/^Bearer\s+/i,"");if(!token)return json(401,{error:"Authentication required"});
   const identity=await deps.auth.verify(token);if(!identity)return json(401,{error:"Invalid session"});
   const center=await deps.center(identity.accountId,identity);const body=(req as any).body as {id?:string};if(!body?.id)return json(400,{error:"Notification id required"});center.markNotificationRead(body.id);return json(200,{ok:true,notifications:center.notificationSummary()});
 }
 if(req.method==="GET"&&req.path==="/api/me"){
   const token=req.headers?.authorization?.replace(/^Bearer\s+/i,"");
   if(!token)return json(401,{error:"Authentication required"});
   const identity=await deps.auth.verify(token);
   return identity?json(200,identity):json(401,{error:"Invalid session"});
 }
 return json(404,{error:"Not found"});
}

export function dashboardHTML():string{
 return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Skillprint — Command Center</title><style>
:root{color-scheme:light}*{box-sizing:border-box}body{font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;margin:0;background:#f6f7f9;color:#111827}main{max-width:1180px;margin:auto;padding:24px}.top{display:flex;justify-content:space-between;gap:16px;align-items:end;margin-bottom:22px}.muted{color:#6b7280}.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.card{background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:16px;box-shadow:0 1px 2px #0000000a}.num{font-size:28px;font-weight:750;margin-top:5px}.section{margin-top:18px}.section h2{font-size:17px;margin:0 0 10px}.list{display:grid;gap:8px}.row{display:flex;justify-content:space-between;gap:12px;align-items:center;padding:12px;background:#fff;border:1px solid #e5e7eb;border-radius:12px}.pill{padding:4px 8px;border-radius:999px;background:#eef2ff;font-size:12px}.bar{height:8px;background:#e5e7eb;border-radius:99px;overflow:hidden}.fill{height:100%;background:#111827}.error{color:#b91c1c}@media(max-width:760px){.grid{grid-template-columns:repeat(2,1fr)}.top{display:block}}@media(max-width:420px){.grid{grid-template-columns:1fr 1fr}main{padding:16px}.num{font-size:23px}}
</style></head><body><main><header class="top"><div><h1>Skillprint Command Center</h1><div class="muted">Your job search, applications and career signals in one place.</div></div><div id="sync" class="muted">Live data</div></header><section id="app"><p>Loading your career data…</p></section></main><script>
const token=localStorage.getItem("skillprint_session"),app=document.getElementById("app");
const esc=s=>String(s??"").replace(/[&<>"']/g,x=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[x]));
async function load(){if(!token){app.innerHTML='<p class="error">Sign in is required before viewing your Command Center.</p>';return}
try{const r=await fetch("/api/dashboard",{headers:{Authorization:"Bearer "+token}});const d=await r.json();if(!r.ok)throw Error(d.error||"Request failed");const a=d.analytics,s=d.snapshot;
const pct=x=>Math.round(Number(x)||0);
const stats=[["Active opportunities",a.activeOpportunities],["Saved",a.saved],["Applications",a.applications],["Interviews",a.interviews],["Offers",a.offers],["Avg match score",a.averageMatchScore],["Response rate",pct(a.responseRate)+"%"],["Pending applications",a.pendingApplications]];
const recent=[...s.notifications].sort((x,y)=>y.createdAt.localeCompare(x.createdAt)).slice(0,6);
const apps=[...s.applications].slice(-8).reverse();
app.innerHTML='<div class="grid">'+stats.map(x=>'<div class="card"><div class="muted">'+esc(x[0])+'</div><div class="num">'+esc(x[1])+'</div></div>').join("")+'</div>'+
'<div class="section"><h2>Application pipeline</h2><div class="grid">'+[["Queued",s.applications.filter(x=>x.state==="queued").length],["Ready",s.applications.filter(x=>x.state==="ready").length],["Approved",s.applications.filter(x=>x.state==="approved").length],["Submitted",s.applications.filter(x=>x.state==="submitted").length]].map(x=>'<div class="card"><div>'+x[0]+'</div><div class="num">'+x[1]+'</div></div>').join("")+'</div></div>'+
'<div class="section"><h2>Latest activity</h2><div class="list">'+(recent.length?recent.map(n=>'<div class="row"><div><strong>'+esc(n.title)+'</strong><div class="muted">'+esc(n.message)+'</div></div><span class="pill">'+esc(n.type)+'</span></div>').join(""):'<div class="card muted">No career activity yet.</div>')+'</div></div>'+
'<div class="section"><h2>Applications</h2><div class="list">'+(apps.length?apps.map(x=>{const job=s.opportunities.find(o=>o.id===x.jobId)?.job;return '<div class="row"><div><strong>'+esc(job?.title||"Application")+'</strong><div class="muted">'+esc(job?.company||"")+'</div></div><span class="pill">'+esc(x.state)+'</span></div>'}).join(""):'<div class="card muted">No applications yet.</div>')+'</div></div>';
document.getElementById("sync").textContent="Updated "+new Date().toLocaleTimeString();
}catch(e){app.innerHTML='<p class="error">'+esc(e.message)+'</p>'}}
load();setInterval(load,60000);
</script></body></html>`;
}