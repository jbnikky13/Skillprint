import crypto from "node:crypto";
import {createClient,type SupabaseClient} from "@supabase/supabase-js";
import type {GmailConnection} from "./gmail.js";

const key=()=>{const raw=process.env.GMAIL_TOKEN_ENCRYPTION_KEY; if(!raw||!/^[0-9a-fA-F]{64}$/.test(raw))throw new Error("GMAIL_TOKEN_ENCRYPTION_KEY must be a 64-character hex key");return Buffer.from(raw,"hex");};
const seal=(value?:string)=>{if(!value)return null;const iv=crypto.randomBytes(12);const cipher=crypto.createCipheriv("aes-256-gcm",key(),iv);const body=Buffer.concat([cipher.update(value,"utf8"),cipher.final()]);return [iv.toString("base64url"),cipher.getAuthTag().toString("base64url"),body.toString("base64url")].join(".");};
const open=(value?:string|null)=>{if(!value)return undefined;const [iv,tag,body]=value.split(".");const decipher=crypto.createDecipheriv("aes-256-gcm",key(),Buffer.from(iv,"base64url"));decipher.setAuthTag(Buffer.from(tag,"base64url"));return Buffer.concat([decipher.update(Buffer.from(body,"base64url")),decipher.final()]).toString("utf8");};

export class GmailConnectionRepository{
 private client:SupabaseClient;
 constructor(url=process.env.SUPABASE_URL,key=process.env.SUPABASE_SECRET_KEY??process.env.SUPABASE_SERVICE_ROLE_KEY){
  if(!url||!key)throw new Error("Supabase server credentials are required");
  this.client=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
 }
 async list():Promise<GmailConnection[]>{const {data,error}=await this.client.from("skillprint_gmail_connections").select("*").eq("status","connected");if(error)throw new Error(error.message);return (data??[]).map(data=>({accountId:data.account_id,googleSub:data.google_sub,email:data.email,accessToken:open(data.access_token),refreshToken:open(data.refresh_token),tokenExpiresAt:data.token_expires_at??undefined,scope:data.scope,historyId:data.history_id??undefined,lastSyncAt:data.last_sync_at??undefined,status:data.status}));}
 async get(accountId:string):Promise<GmailConnection|undefined>{
  const {data,error}=await this.client.from("skillprint_gmail_connections").select("*").eq("account_id",accountId).maybeSingle();
  if(error)throw new Error(error.message);if(!data)return undefined;
  return {accountId:data.account_id,googleSub:data.google_sub,email:data.email,accessToken:open(data.access_token),refreshToken:open(data.refresh_token),tokenExpiresAt:data.token_expires_at??undefined,scope:data.scope,historyId:data.history_id??undefined,lastSyncAt:data.last_sync_at??undefined,status:data.status};
 }
 async save(c:GmailConnection){const {error}=await this.client.from("skillprint_gmail_connections").upsert({account_id:c.accountId,google_sub:c.googleSub,email:c.email,access_token:seal(c.accessToken),refresh_token:seal(c.refreshToken),token_expires_at:c.tokenExpiresAt??null,scope:c.scope,history_id:c.historyId??null,last_sync_at:c.lastSyncAt??null,status:c.status,updated_at:new Date().toISOString()},{onConflict:"account_id"});if(error)throw new Error(error.message);}
 async disconnect(accountId:string){const {error}=await this.client.from("skillprint_gmail_connections").delete().eq("account_id",accountId);if(error)throw new Error(error.message);}
}
