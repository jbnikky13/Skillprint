import type { SentApplicationCopy } from "./archive.js";
export interface ApplicationStore{save(record:SentApplicationCopy):Promise<void>;list(accountId:string):Promise<SentApplicationCopy[]>;get(accountId:string,id:string):Promise<SentApplicationCopy|undefined>;}
export class MemoryApplicationStore implements ApplicationStore{private records=new Map<string,SentApplicationCopy[]>();
async save(record:SentApplicationCopy){this.records.set("default",[...(this.records.get("default")??[]),structuredClone(record)]);}
async list(accountId:string){return structuredClone(this.records.get(accountId)??this.records.get("default")??[]);}
async get(accountId:string,id:string){return(await this.list(accountId)).find(x=>x.id===id);}}
