import { dashboardView } from "./dashboard.js";
import type { CareerCommandCenter } from "../command-center/store.js";
import type { AuthProvider } from "./auth.js";

export interface HTTPRequest { method:string; path:string; headers?:Record<string,string|undefined>; body?:unknown; }
export interface HTTPResponse { status:number; headers:Record<string,string>; body:string; }

const json=(status:number,value:unknown):HTTPResponse=>({status,headers:{"content-type":"application/json","cache-control":"no-store"},body:JSON.stringify(value)});

export async function handleProductRequest(
 req:HTTPRequest,
 deps:{auth:AuthProvider; center:(accountId:string)=>CareerCommandCenter}
):Promise<HTTPResponse>{
 if(req.method==="GET"&&req.path==="/health")return json(200,{ok:true,service:"skillprint"});
 if(req.method==="GET"&&req.path==="/api/dashboard"){
   const token=req.headers?.authorization?.replace(/^Bearer\s+/i,"");
   if(!token)return json(401,{error:"Authentication required"});
   const identity=await deps.auth.verify(token);
   if(!identity)return json(401,{error:"Invalid session"});
   return json(200,dashboardView(deps.center(identity.accountId)));
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
