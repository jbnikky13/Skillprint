import {createClient,type SupabaseClient} from "@supabase/supabase-js";
import type {GmailConnection} from "./gmail.js";

export class GmailConnectionRepository{
 private client:SupabaseClient;
 constructor(url=process.env.SUPABASE_URL,key=process.env.SUPABASE_SECRET_KEY??process.env.SUPABASE_SERVICE_ROLE_KEY){
  if(!url||!key)throw new Error("Supabase server credentials are required");
  this.client=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
 }
 async get(accountId:string):Promise<GmailConnection|undefined>{
  const {data,error}=await this.client.from("skillprint_gmail_connections").select("*").eq("account_id",accountId).maybeSingle();
  if(error)throw new Error(error.message);if(!data)return undefined;
  return {accountId:data.account_id,googleSub:data.google_sub,email:data.email,accessToken:data.access_token??undefined,refreshToken:data.refresh_token??undefined,tokenExpiresAt:data.token_expires_at??undefined,scope:data.scope,historyId:data.history_id??undefined,lastSyncAt:data.last_sync_at??undefined,status:data.status};
 }
 async save(c:GmailConnection){const {error}=await this.client.from("skillprint_gmail_connections").upsert({account_id:c.accountId,google_sub:c.googleSub,email:c.email,access_token:c.accessToken??null,refresh_token:c.refreshToken??null,token_expires_at:c.tokenExpiresAt??null,scope:c.scope,history_id:c.historyId??null,last_sync_at:c.lastSyncAt??null,status:c.status,updated_at:new Date().toISOString()},{onConflict:"account_id"});if(error)throw new Error(error.message);}
 async disconnect(accountId:string){const {error}=await this.client.from("skillprint_gmail_connections").delete().eq("account_id",accountId);if(error)throw new Error(error.message);}
}
