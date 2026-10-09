import crypto from "node:crypto";
import {createClient} from "@supabase/supabase-js";
const SCOPE="https://www.googleapis.com/auth/gmail.readonly openid email";
function stateFor(accountId){const secret=process.env.GMAIL_OAUTH_STATE_SECRET;if(!secret)throw new Error("GMAIL_OAUTH_STATE_SECRET is not configured");const payload=Buffer.from(JSON.stringify({accountId,exp:Date.now()+10*60*1000,nonce:crypto.randomBytes(16).toString("hex")})).toString("base64url");const sig=crypto.createHmac("sha256",secret).update(payload).digest("base64url");return payload+"."+sig;}
export default async function handler(req,res){
 if(req.method!=="POST")return res.status(405).json({error:"Method not allowed"});
 try{
  const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_PUBLISHABLE_KEY,clientId=process.env.GOOGLE_GMAIL_CLIENT_ID,redirectUri=process.env.GOOGLE_GMAIL_REDIRECT_URI;
  if(!url||!key||!clientId||!redirectUri)throw new Error("Supabase and Google Gmail OAuth settings are required.");
  const auth=String(req.headers.authorization||"");const token=auth.match(/^Bearer\s+(.+)$/i)?.[1];if(!token)return res.status(401).json({error:"Sign in to Skillprint first."});
  const supabase=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data,error}=await supabase.auth.getUser(token);if(error||!data.user)return res.status(401).json({error:"Your Skillprint session is invalid. Sign in again."});
  const state=stateFor(data.user.id);
  const q=new URLSearchParams({client_id:clientId,redirect_uri:redirectUri,response_type:"code",access_type:"offline",prompt:"consent",scope:SCOPE,state});
  res.setHeader("Cache-Control","no-store");return res.status(200).json({authorizationUrl:"https://accounts.google.com/o/oauth2/v2/auth?"+q.toString()});
 }catch(e){return res.status(500).json({error:e instanceof Error?e.message:"Could not start Gmail connection."});}
}
