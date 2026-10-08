import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type {Account,PrivacySettings,Subscription} from "./types.js";
import type {CommandCenterSnapshot} from "../command-center/types.js";

export interface PersistedUser{
 account:Account;
 privacy:PrivacySettings;
 subscription:Subscription;
 dashboard:CommandCenterSnapshot;
 updatedAt:string;
}
export interface UserRepository{
 get(accountId:string):Promise<PersistedUser|undefined>;
 save(user:PersistedUser):Promise<void>;
 delete(accountId:string):Promise<void>;
}
export class MemoryUserRepository implements UserRepository{
 private users=new Map<string,PersistedUser>();
 async get(accountId:string){const u=this.users.get(accountId);return u?structuredClone(u):undefined;}
 async save(user:PersistedUser){this.users.set(user.account.id,structuredClone(user));}
 async delete(accountId:string){this.users.delete(accountId);}
}

const emptyDashboard=():CommandCenterSnapshot=>({opportunities:[],applications:[],interviews:[],offers:[],messages:[],notifications:[]});
export const defaultPersistedUser=(account:Account):PersistedUser=>{
  const privacy:PrivacySettings={profileVisibility:"private",allowRecruiterDiscovery:false,allowModelImprovement:false,shareContactAfterMatch:false,dataRetentionDays:365};
  const subscription:Subscription={accountId:account.id,planId:"free",status:"trialing"};
  return {account,privacy,subscription,dashboard:emptyDashboard(),updatedAt:new Date().toISOString()};
};

export class SupabaseUserRepository implements UserRepository{
 private client:SupabaseClient;
 constructor(
   url=process.env.SUPABASE_URL,
   secretKey=process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
 ){
   if(!url||!secretKey) throw new Error("SUPABASE_URL and SUPABASE_SECRET_KEY are required");
   this.client=createClient(url,secretKey,{auth:{persistSession:false,autoRefreshToken:false}});
 }
 async get(accountId:string){
   const {data,error}=await this.client.from("skillprint_users").select("account_id,account,privacy,subscription,dashboard,updated_at").eq("account_id",accountId).maybeSingle();
   if(error) throw new Error(error.message);
   if(!data)return undefined;
   return {
     account:data.account as Account,
     privacy:data.privacy as PrivacySettings,
     subscription:data.subscription as Subscription,
     dashboard:data.dashboard as CommandCenterSnapshot,
     updatedAt:data.updated_at
   };
 }
 async save(user:PersistedUser){
   const {error}=await this.client.from("skillprint_users").upsert({
     account_id:user.account.id,
     account:user.account,
     privacy:user.privacy,
     subscription:user.subscription,
     dashboard:user.dashboard,
     updated_at:user.updatedAt
   },{onConflict:"account_id"});
   if(error) throw new Error(error.message);
 }
 async delete(accountId:string){
   const {error}=await this.client.from("skillprint_users").delete().eq("account_id",accountId);
   if(error) throw new Error(error.message);
 }

}
