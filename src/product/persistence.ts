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
