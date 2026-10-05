import type {APIKey,Account} from "./types.js";
export interface APIContext{account:Account;apiKey:APIKey;}
export interface SkillprintAPI{version:"v1";authenticate(key:string):Promise<APIContext|null>;}
export class APIKeyRegistry{
 private keys=new Map<string,APIKey>();
 issue(accountId:string,label:string):APIKey{const raw="sk_"+crypto.randomUUID().replace(/-/g,"");const key:APIKey={id:crypto.randomUUID(),accountId,label,prefix:raw.slice(0,10),createdAt:new Date().toISOString()};this.keys.set(raw,key);return key;}
 revoke(id:string):void{for(const [raw,key] of this.keys)if(key.id===id)this.keys.set(raw,{...key,revokedAt:new Date().toISOString()});}
 resolve(raw:string):APIKey|undefined{const key=this.keys.get(raw);return key&&!key.revokedAt?key:undefined;}
}
