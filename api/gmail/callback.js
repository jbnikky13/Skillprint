import crypto from "node:crypto";
import {createClient} from "@supabase/supabase-js";
const enc=v=>encodeURIComponent(v);
function verifyState(state){const secret=process.env.GMAIL_OAUTH_STATE_SECRET;if(!secret)return null;const parts=String(state||"").split(".");if(parts.length!==2)return null;const [payload,sig]=parts;const expected=crypto.createHmac("sha256",secret).update(payload).digest();let actual;try{actual=Buffer.from(sig,"base64url")}catch{return null}if(actual.length!==expected.length||!crypto.timingSafeEqual(actual,expected))return null;try{const p=JSON.parse(Buffer.from(payload,"base64url").toString("utf8"));if(!p.accountId||!p.exp||p.exp<Date.now())return null;return String(p.accountId)}catch{return null}}
function seal(value){const raw=process.env.GMAIL_TOKEN_ENCRYPTION_KEY;if(!raw||!/^[0-9a-fA-F]{64}$/.test(raw))throw new Error("GMAIL_TOKEN_ENCRYPTION_KEY must be 64 hexadecimal characters");const iv=crypto.randomBytes(12),cipher=crypto.createCipheriv("aes-256-gcm",Buffer.from(raw,"hex"),iv),body=Buffer.concat([cipher.update(value,"utf8"),cipher.final()]);return [iv.toString("base64url"),cipher.getAuthTag().toString("base64url"),body.toString("base64url")].join(".")}
function finish(res,kind){return res.redirect(302,"/?gmail="+encodeURIComponent(kind))}
export default async function handler(req,res){
 if(req.method!=="GET")return res.status(405).send("Method not allowed");
 if(req.query?.error)return finish(res,"cancelled");
 try{
  const accountId=verifyState(req.query?.state);if(!accountId)return finish(res,"invalid_state");
  const code=String(req.query?.code||"");if(!code)return finish(res,"missing_code");
  const clientId=process.env.GOOGLE_GMAIL_CLIENT_ID,clientSecret=process.env.GOOGLE_GMAIL_CLIENT_SECRET,redirectUri=process.env.GOOGLE_GMAIL_REDIRECT_URI;
  const url=process.env.SUPABASE_URL,adminKey=process.env.SUPABASE_SECRET_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!clientId||!clientSecret||!redirectUri||!url||!adminKey)throw new Error("Gmail OAuth or Supabase server credentials are missing.");
  const body=new URLSearchParams({code,client_id:clientId,client_secret:clientSecret,redirect_uri:redirectUri,grant_type:"authorization_code"});
  const tokenResponse=await fetch("https://oauth2.googleapis.com/token",{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded"},body});
  const tokens=await tokenResponse.json();if(!tokenResponse.ok||!tokens.access_token)throw new Error(tokens.error||"Google token exchange failed");
  const [profileResponse,identityResponse]=await Promise.all([
   fetch("https://gmail.googleapis.com/gmail/v1/users/me/profile",{headers:{authorization:"Bearer "+tokens.access_token}}),
   fetch("https://openidconnect.googleapis.com/v1/userinfo",{headers:{authorization:"Bearer "+tokens.access_token}})
  ]);
  const profile=await profileResponse.json(),identity=await identityResponse.json();
  if(!profileResponse.ok||!profile.emailAddress)throw new Error("Could not verify the connected Gmail account.");
  if(!identityResponse.ok||!identity.sub)throw new Error("Could not verify the Google account identity. Reconnect and grant email access.");
  const db=createClient(url,adminKey,{auth:{persistSession:false,autoRefreshToken:false}});
  const {error}=await db.from("skillprint_gmail_connections").upsert({
   account_id:accountId,google_sub:identity.sub,email:profile.emailAddress,
   access_token:seal(tokens.access_token),refresh_token:tokens.refresh_token?seal(tokens.refresh_token):null,
   token_expires_at:new Date(Date.now()+(tokens.expires_in||3600)*1000).toISOString(),
   scope:tokens.scope||"https://www.googleapis.com/auth/gmail.readonly openid email",
   history_id:profile.historyId||null,last_sync_at:null,status:"connected",updated_at:new Date().toISOString()
  },{onConflict:"account_id"});
  if(error)throw error;
  return finish(res,"connected");
 }catch(e){console.error("Gmail OAuth callback failed:",e instanceof Error?e.message:"unknown error");return finish(res,"error")}
}
