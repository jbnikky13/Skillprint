import { createServer } from "node:http";
import { CareerCommandCenter } from "../command-center/store.js";
import { DevAuthProvider } from "./auth.js";
import { dashboardHTML, handleProductRequest } from "./http.js";

const center=new CareerCommandCenter();
const auth=new DevAuthProvider();
const port=Number(process.env.PORT??3000);

const server=createServer(async(req,res)=>{
 const url=new URL(req.url??"/","http://localhost");
 if(req.method==="GET"&&url.pathname==="/"){res.writeHead(200,{"content-type":"text/html; charset=utf-8"});res.end(dashboardHTML());return;}
 const response=await handleProductRequest({method:req.method??"GET",path:url.pathname,headers:req.headers as Record<string,string|undefined>},{auth,center});
 res.writeHead(response.status,response.headers);res.end(response.body);
});
server.listen(port,()=>console.log(`Skillprint product server listening on ${port}`));
