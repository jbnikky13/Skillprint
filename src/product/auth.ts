import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type {Account,UserRole} from "./types.js";

export interface AuthIdentity{accountId:string;email:string;role:UserRole;}
export interface AuthProvider{signIn(email:string,password?:string):Promise<AuthIdentity>;signOut(accountId:string):Promise<void>;verify(token:string):Promise<AuthIdentity|null>;}

export class DevAuthProvider implements AuthProvider{
 private sessions=new Map<string,AuthIdentity>();
 async signIn(email:string):Promise<AuthIdentity>{const account:AuthIdentity={accountId:"acct-"+Buffer.from(email).toString("base64url").slice(0,18),email,role:"candidate"};this.sessions.set(account.accountId,account);return account;}
 async signOut(accountId:string){this.sessions.delete(accountId);}
 async verify(accountId:string){return this.sessions.get(accountId)??null;}
}

/**
 * Production Supabase Auth provider.
 * The browser/client uses the publishable key; privileged database work remains
 * server-side and must use the server-only secret key.
 */
export class SupabaseAuthProvider implements AuthProvider {
  private client: SupabaseClient;
  private admin?: SupabaseClient;
  constructor(
    url=process.env.SUPABASE_URL,
    publishableKey=process.env.SUPABASE_PUBLISHABLE_KEY,
    secretKey=process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  ){
    if(!url||!publishableKey) throw new Error("SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY are required");
    this.client=createClient(url,publishableKey,{auth:{persistSession:false,autoRefreshToken:false}});
    if(secretKey) this.admin=createClient(url,secretKey,{auth:{persistSession:false,autoRefreshToken:false}});
  }
  async signIn(email:string,password?:string):Promise<AuthIdentity>{
    if(!password) throw new Error("Password is required for production sign-in");
    const {data,error}=await this.client.auth.signInWithPassword({email,password});
    if(error||!data.user) throw new Error(error?.message??"Authentication failed");
    return {accountId:data.user.id,email:data.user.email??email,role:"candidate"};
  }
  async signOut(token:string):Promise<void>{
    // Server requests authenticate by access token; revoke that session explicitly.
    if(!this.admin) return;
    const {error}=await this.admin.auth.admin.signOut(token);
    if(error) throw new Error(error.message);
  }
  async verify(token:string):Promise<AuthIdentity|null>{
    if(!token) return null;
    const {data,error}=await this.client.auth.getUser(token);
    if(error||!data.user) return null;
    return {accountId:data.user.id,email:data.user.email??"",role:"candidate"};
  }
}
