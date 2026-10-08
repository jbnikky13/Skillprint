import crypto from "node:crypto";

export const GMAIL_READONLY_SCOPE="https://www.googleapis.com/auth/gmail.readonly";

export interface GmailConnection{accountId:string;googleSub:string;email:string;accessToken?:string;refreshToken?:string;tokenExpiresAt?:string;scope:string;historyId?:string;lastSyncAt?:string;status:"connected"|"revoked"|"error";}
export interface GmailMessage{ id:string;threadId?:string;internalDate?:string;snippet?:string;labelIds?:string[];headers:Record<string,string>;bodyText?:string; }

const enc=(v:string)=>encodeURIComponent(v);
const b64url=(v:Buffer|string)=>Buffer.from(v).toString("base64url");

export function gmailOAuthConfig(){
 const clientId=process.env.GOOGLE_GMAIL_CLIENT_ID;
 const clientSecret=process.env.GOOGLE_GMAIL_CLIENT_SECRET;
 const redirectUri=process.env.GOOGLE_GMAIL_REDIRECT_URI;
 if(!clientId||!clientSecret||!redirectUri)throw new Error("Gmail OAuth is not configured. Set GOOGLE_GMAIL_CLIENT_ID, GOOGLE_GMAIL_CLIENT_SECRET and GOOGLE_GMAIL_REDIRECT_URI.");
 return {clientId,clientSecret,redirectUri};
}

export function createGmailAuthorizationUrl(state:string){
 const {clientId,redirectUri}=gmailOAuthConfig();
 return "https://accounts.google.com/o/oauth2/v2/auth?"+[
   ["client_id",clientId],["redirect_uri",redirectUri],["response_type","code"],
   ["access_type","offline"],["prompt","consent"],["scope",GMAIL_READONLY_SCOPE],["state",state]
 ].map(([k,v])=>enc(k)+"="+enc(v)).join("&");
}

export async function exchangeGmailCode(code:string){
 const {clientId,clientSecret,redirectUri}=gmailOAuthConfig();
 const body=new URLSearchParams({code,client_id:clientId,client_secret:clientSecret,redirect_uri:redirectUri,grant_type:"authorization_code"});
 const r=await fetch("https://oauth2.googleapis.com/token",{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded"},body});
 const data=await r.json() as {access_token?:string;refresh_token?:string;expires_in?:number;scope?:string;error?:string};
 if(!r.ok||!data.access_token)throw new Error(data.error??"Google OAuth token exchange failed");
 return {accessToken:data.access_token,refreshToken:data.refresh_token,expiresAt:new Date(Date.now()+(data.expires_in??3600)*1000).toISOString(),scope:data.scope??GMAIL_READONLY_SCOPE};
}

async function googleJson(url:string,token:string,init:RequestInit={}){
 const r=await fetch(url,{...init,headers:{...(init.headers??{}),authorization:"Bearer "+token}});
 const data=await r.json();
 if(!r.ok)throw new Error(typeof data?.error?.message==="string"?data.error.message:"Gmail API request failed");
 return data;
}

export async function gmailProfile(accessToken:string){
 return googleJson("https://gmail.googleapis.com/gmail/v1/users/me/profile",accessToken) as Promise<{emailAddress:string;historyId:string;messagesTotal:number;threadsTotal:number}>;
}

export async function listGmailMessages(accessToken:string,q:string,maxResults=50){
 const u=new URL("https://gmail.googleapis.com/gmail/v1/users/me/messages");u.searchParams.set("q",q);u.searchParams.set("maxResults",String(Math.min(maxResults,500)));
 return googleJson(u.toString(),accessToken) as Promise<{messages?:{id:string;threadId:string}[];nextPageToken?:string;resultSizeEstimate?:number}>;
}

function decodeBody(data:string){try{return Buffer.from(data.replace(/-/g,"+").replace(/_/g,"/"),"base64").toString("utf8")}catch{return ""}}
function walkParts(part:any,out:string[]){if(part?.mimeType==="text/plain"&&part.body?.data)out.push(decodeBody(part.body.data));for(const p of part?.parts??[])walkParts(p,out)}

export async function getGmailMessage(accessToken:string,id:string):Promise<GmailMessage>{
 const data=await googleJson("https://gmail.googleapis.com/gmail/v1/users/me/messages/"+enc(id)+"?format=full",accessToken) as any;
 const headers:Record<string,string>={};for(const h of data.payload?.headers??[])headers[String(h.name).toLowerCase()]=String(h.value);
 const parts:string[]=[];walkParts(data.payload,parts);
 return {id:data.id,threadId:data.threadId,internalDate:data.internalDate,snippet:data.snippet,labelIds:data.labelIds,headers,bodyText:parts.join("\n").slice(0,50000)};
}

export type GmailStatus="application_received"|"assessment"|"interview"|"interview_scheduled"|"rejection"|"offer"|"application_viewed"|"unknown";

export function classifyGmailMessage(message:GmailMessage):GmailStatus{
 const text=(message.headers.subject+"\n"+message.snippet+"\n"+(message.bodyText??"")).toLowerCase();
 if(/offer|we are pleased to offer|employment offer/.test(text))return "offer";
 if(/rejected|unfortunately|not moving forward|decline your application/.test(text))return "rejection";
 if(/interview|schedule.*(?:call|conversation)|meet with.*team/.test(text))return /schedule|scheduled|calendar/.test(text)?"interview_scheduled":"interview";
 if(/assessment|coding challenge|take[- ]home|technical test|assignment/.test(text))return "assessment";
 if(/application (?:received|submitted)|thank you for applying|application has been received/.test(text))return "application_received";
 if(/application (?:viewed|reviewed)|recruiter.*viewed/.test(text))return "application_viewed";
 return "unknown";
}

export function gmailStateToken(accountId:string,secret:string){
 return b64url(crypto.createHmac("sha256",secret).update(accountId).digest());
}
