import type { CareerCommandCenter } from "./store.js";
import { ingestStatusEmail } from "./status.js";
export interface EmailMessage{messageId:string;threadId?:string;from:string;subject:string;body:string;receivedAt?:string;}
export interface EmailStatusConnector{poll():Promise<EmailMessage[]>;}
export interface EmailIngestionResult{processed:number;messageIds:string[];}
export async function ingestMailbox(connector:EmailStatusConnector,center:CareerCommandCenter):Promise<EmailIngestionResult>{
 const messages=await connector.poll();
 for(const m of messages)ingestStatusEmail(center,{sender:m.from,subject:m.subject,body:m.body});
 return {processed:messages.length,messageIds:messages.map(m=>m.messageId)};
}
