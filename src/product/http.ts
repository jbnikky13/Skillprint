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
 if(req.method==="GET"&&req.path==="/api/me"){
   const token=req.headers?.authorization?.replace(/^Bearer\s+/i,"");
   if(!token)return json(401,{error:"Authentication required"});
   const identity=await deps.auth.verify(token);
   return identity?json(200,identity):json(401,{error:"Invalid session"});
 }
 return json(404,{error:"Not found"});
}

export function dashboardHTML():string{
 return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Skillprint Command Center</title><style>body{font-family:system-ui;margin:0;background:#f6f7f9;color:#111827}main{max-width:1100px;margin:auto;padding:32px}h1{margin-bottom:6px}.muted{color:#6b7280}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:14px}.card{background:white;border:1px solid #e5e7eb;border-radius:14px;padding:18px}.num{font-size:30px;font-weight:700;margin-top:8px}.error{color:#b91c1c}</style></head><body><main><h1>Skillprint Command Center</h1><p class="muted">Career pipeline and job-matching overview.</p><section id="app"><p>Loading…</p></section></main><script>const token=localStorage.getItem("skillprint_session");const app=document.getElementById("app");if(!token){app.innerHTML='<p class="error">Sign in is required before viewing your Command Center.</p>'}else{fetch("/api/dashboard",{headers:{Authorization:"Bearer "+token}}).then(async r=>{const d=await r.json();if(!r.ok)throw Error(d.error||"Request failed");const a=d.analytics;app.innerHTML='<div class="grid">'+[['Active opportunities',a.activeOpportunities],['Saved',a.saved],['Applications',a.applications],['Interviews',a.interviews],['Offers',a.offers],['Match score',a.averageMatchScore],['Response rate',a.responseRate+"%"],['Pending applications',a.pendingApplications]].map(x=>'<div class="card"><div class="muted">'+x[0]+'</div><div class="num">'+x[1]+'</div></div>').join("")+'</div>'}).catch(e=>app.innerHTML='<p class="error">'+e.message+"</p>")}</script></body></html>`;
}
