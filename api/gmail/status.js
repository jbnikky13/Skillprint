export default async function handler(req,res){
 if(req.method!=="GET")return res.status(405).json({error:"Method not allowed"});
 try{
  const clean=value=>String(value||"").trim().replace(/^["']|["']$/g,"");
  const rawUrl=clean(process.env.SUPABASE_URL);
  const publishableKey=clean(process.env.SUPABASE_PUBLISHABLE_KEY);
  const serverKey=clean(process.env.SUPABASE_SECRET_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY);
  if(!rawUrl||!publishableKey||!serverKey)throw new Error("Gmail status is missing Supabase URL, publishable key, or server key.");
  let base;
  try{base=new URL(rawUrl)}catch{throw new Error("SUPABASE_URL in Vercel must be a valid URL.");}
  if(base.protocol!=="https:"&&base.hostname!=="localhost")throw new Error("SUPABASE_URL must use HTTPS.");
  const token=String(req.headers.authorization||"").match(/^Bearer\s+(.+)$/i)?.[1];
  if(!token)return res.status(401).json({error:"Sign in to Skillprint first."});
  // Use the Auth and REST HTTP APIs directly. This supports modern sb_publishable_
  // and sb_secret_ keys even if the project's installed supabase-js version predates them.
  const root=base.origin+base.pathname.replace(/\/$/,"");
  const authResponse=await fetch(root+"/auth/v1/user",{headers:{apikey:publishableKey,authorization:"Bearer "+token}});
  const user=await authResponse.json().catch(()=>null);
  if(!authResponse.ok||!user?.id)return res.status(401).json({error:"Your Skillprint session is invalid. Sign in again."});
  const query=new URLSearchParams({select:"email,status,updated_at",account_id:"eq."+user.id,limit:"1"});
  const dbResponse=await fetch(root+"/rest/v1/skillprint_gmail_connections?"+query.toString(),{headers:{apikey:serverKey,authorization:"Bearer "+serverKey,accept:"application/json"}});
  const rows=await dbResponse.json().catch(()=>null);
  if(!dbResponse.ok)throw new Error("Could not read Gmail status ("+dbResponse.status+"): "+(rows?.message||rows?.hint||"Supabase REST request failed."));
  const row=Array.isArray(rows)?rows[0]:null;
  res.setHeader("Cache-Control","no-store");
  return res.status(200).json({connected:row?.status==="connected",email:row?.email||null,status:row?.status||"disconnected"});
 }catch(e){
  console.error("Gmail status failed:",e instanceof Error?e.message:"unknown error");
  return res.status(500).json({error:e instanceof Error?e.message:"Could not load Gmail connection status."});
 }
}
