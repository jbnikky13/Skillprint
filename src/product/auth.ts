import type {Account,UserRole} from "./types.js";
export interface AuthIdentity{accountId:string;email:string;role:UserRole;}
export interface AuthProvider{signIn(email:string):Promise<AuthIdentity>;signOut(accountId:string):Promise<void>;verify(accountId:string):Promise<AuthIdentity|null>;}
export class DevAuthProvider implements AuthProvider{
 private sessions=new Map<string,AuthIdentity>();
 async signIn(email:string):Promise<AuthIdentity>{const account:AuthIdentity={accountId:"acct-"+Buffer.from(email).toString("base64url").slice(0,18),email,role:"candidate"};this.sessions.set(account.accountId,account);return account;}
 async signOut(accountId:string){this.sessions.delete(accountId);}
 async verify(accountId:string){return this.sessions.get(accountId)??null;}
}
