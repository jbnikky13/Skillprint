import { createServer } from "node:http";
import { CareerCommandCenter } from "../command-center/store.js";
import { SupabaseUserRepository, MemoryUserRepository, defaultPersistedUser, type UserRepository } from "./persistence.js";
import type { AuthIdentity } from "./auth.js";
import { GmailConnectionRepository } from "./gmail-repository.js";
import { exchangeGmailCode, gmailProfile, verifyGmailState } from "./gmail.js";
import { DevAuthProvider } from "./auth.js";
import { dashboardHTML, handleProductRequest } from "./http.js";

const centers=new Map<string,CareerCommandCenter>();
const gmail=process.env.SUPABASE_URL&&(process.env.SUPABASE_SECRET_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY) ? new GmailConnectionRepository() : undefined;
const repository:UserRepository=process.env.SUPABASE_URL&&(process.env.SUPABASE_SECRET_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY) ? new SupabaseUserRepository() : new MemoryUserRepository();
const centerFor=async(accountId:string,identity?:AuthIdentity)=>{let center=centers.get(accountId);if(center)return center;let persisted=await repository.get(accountId);if(!persisted&&identity){const account={id:identity.accountId,email:identity.email,role:identity.role,createdAt:new Date().toISOString(),status:"active" as const};persisted=defaultPersistedUser(account);await repository.save(persisted);}center=new CareerCommandCenter(persisted?.dashboard);centers.set(accountId,center);return center;};
const auth=process.env.SUPABASE_URL&&process.env.SUPABASE_PUBLISHABLE_KEY ? new (await import("./auth.js")).SupabaseAuthProvider() : new (await import("./auth.js")).DevAuthProvider();
const port=Number(process.env.PORT??3000);

const server=createServer(async(req,res)=>{
 const url=new URL(req.url??"/","http://localhost");
 if(req.method==="GET"&&url.pathname==="/"){res.writeHead(200,{"content-type":"text/html; charset=utf-8"});res.end(dashboardHTML());return;}
 if(req.method==="GET"&&url.pathname==="/api/gmail/callback"){
 try{
  const accountId=verifyGmailState(url.searchParams.get("state")??"");
  const code=url.searchParams.get("code");
  if(!accountId||!code||!gmail){res.writeHead(400,{"content-type":"text/html; charset=utf-8"});res.end("<h1>Gmail connection failed</h1><p>Invalid or expired authorization.</p>");return;}
  const tokens=await exchangeGmailCode(code);const profile=await gmailProfile(tokens.accessToken);
  await gmail.save({accountId,googleSub:profile.emailAddress,email:profile.emailAddress,accessToken:tokens.accessToken,refreshToken:tokens.refreshToken,tokenExpiresAt:tokens.expiresAt,scope:tokens.scope,historyId:profile.historyId,status:"connected"});
  res.writeHead(302,{location:"/"});res.end();return;
 }catch(e){res.writeHead(502,{"content-type":"text/html; charset=utf-8"});res.end("<h1>Gmail connection failed</h1><p>"+String(e instanceof Error?e.message:"OAuth error").replace(/[<>]/g,"")+"</p>");return;}
}
const response=await handleProductRequest({method:req.method??"GET",path:url.pathname,headers:req.headers as Record<string,string|undefined>},{auth,center:centerFor,gmail});
 res.writeHead(response.status,response.headers);res.end(response.body);
});
server.listen(port,()=>console.log(`Skillprint product server listening on ${port}`));
