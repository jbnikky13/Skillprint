import {GmailConnectionRepository} from "./product/gmail-repository.js";
import {SupabaseUserRepository} from "./product/persistence.js";
import {CareerCommandCenter} from "./command-center/store.js";
import {classifyGmailMessage,getGmailMessage,listGmailHistory,listGmailMessages,refreshGmailAccessToken} from "./product/gmail.js";
import {processGmailEvent} from "./application-events/engine.js";

const gmail=new GmailConnectionRepository();const users=new SupabaseUserRepository();
const run=async()=>{const connections=await gmail.list();let scanned=0,events=0,failed=0;
for(const original of connections){let c=original;try{
 if(!c.accessToken||!c.refreshToken)throw new Error("missing Gmail token");
 if(c.tokenExpiresAt&&new Date(c.tokenExpiresAt).getTime()<Date.now()+60000){const fresh=await refreshGmailAccessToken(c.refreshToken);c.accessToken=fresh.accessToken;c.tokenExpiresAt=fresh.expiresAt;}
 const user=await users.get(c.accountId);if(!user)continue;const center=new CareerCommandCenter(user.dashboard);let ids=new Set<string>();
 if(c.historyId){try{let token:string|undefined;do{const h=await listGmailHistory(c.accessToken,c.historyId,100);for(const x of h.history??[])for(const a of x.messagesAdded??[])ids.add(a.message.id);token=h.nextPageToken;}while(token)}catch{c.historyId=undefined;}}
 if(!c.historyId){const listed=await listGmailMessages(c.accessToken,"newer_than:30d (application OR interview OR assessment OR offer OR rejection)",100);for(const x of listed.messages??[])ids.add(x.id);}
 for(const id of ids){scanned++;const msg=await getGmailMessage(c.accessToken,id);const status=classifyGmailMessage(msg);if(status!=="unknown"&&processGmailEvent(c.accountId,msg,status,center))events++;}
 const profile=await (await import("./product/gmail.js")).gmailProfile(c.accessToken);c.googleSub=profile.emailAddress;c.email=profile.emailAddress;c.historyId=profile.historyId;c.lastSyncAt=new Date().toISOString();c.status="connected";await gmail.save(c);user.dashboard=center.snapshot();user.updatedAt=new Date().toISOString();await users.save(user);
 }catch(e){failed++;c.status="error";try{await gmail.save(c)}catch{}console.error("Gmail sync failed",c.accountId,e instanceof Error?e.message:e)}}
 console.log(JSON.stringify({accounts:connections.length,scanned,events,failed,completedAt:new Date().toISOString()}));};
run().catch(e=>{console.error(e);process.exit(1)});
