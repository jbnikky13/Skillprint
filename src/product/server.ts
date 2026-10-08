import { createServer } from "node:http";
import { CareerCommandCenter } from "../command-center/store.js";
import { SupabaseUserRepository, MemoryUserRepository, type UserRepository } from "./persistence.js";
import { DevAuthProvider } from "./auth.js";
import { dashboardHTML, handleProductRequest } from "./http.js";

const centers=new Map<string,CareerCommandCenter>();
const repository:UserRepository=process.env.SUPABASE_URL&&(process.env.SUPABASE_SECRET_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY) ? new SupabaseUserRepository() : new MemoryUserRepository();
const centerFor=async(accountId:string)=>{let center=centers.get(accountId);if(center)return center;const persisted=await repository.get(accountId);center=new CareerCommandCenter(persisted?.dashboard);centers.set(accountId,center);return center;};
const auth=process.env.SUPABASE_URL&&process.env.SUPABASE_PUBLISHABLE_KEY ? new (await import("./auth.js")).SupabaseAuthProvider() : new (await import("./auth.js")).DevAuthProvider();
const port=Number(process.env.PORT??3000);

const server=createServer(async(req,res)=>{
 const url=new URL(req.url??"/","http://localhost");
 if(req.method==="GET"&&url.pathname==="/"){res.writeHead(200,{"content-type":"text/html; charset=utf-8"});res.end(dashboardHTML());return;}
 const response=await handleProductRequest({method:req.method??"GET",path:url.pathname,headers:req.headers as Record<string,string|undefined>},{auth,center:centerFor});
 res.writeHead(response.status,response.headers);res.end(response.body);
});
server.listen(port,()=>console.log(`Skillprint product server listening on ${port}`));
