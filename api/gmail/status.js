import {createClient} from "@supabase/supabase-js";
export default async function handler(req,res){
 if(req.method!=="GET")return res.status(405).json({error:"Method not allowed"});
 try{
  const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_PUBLISHABLE_KEY,adminKey=process.env.SUPABASE_SECRET_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!url||!key||!adminKey)throw new Error("Supabase credentials are not configured.");
  const token=String(req.headers.authorization||"").match(/^Bearer\s+(.+)$/i)?.[1];if(!token)return res.status(401).json({error:"Sign in to Skillprint first."});
  const auth=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});const {data:userData,error:authError}=await auth.auth.getUser(token);if(authError||!userData.user)return res.status(401).json({error:"Your Skillprint session is invalid."});
  const db=createClient(url,adminKey,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data,error}=await db.from("skillprint_gmail_connections").select("email,status,updated_at").eq("account_id",userData.user.id).maybeSingle();if(error)throw error;
  res.setHeader("Cache-Control","no-store");return res.status(200).json({connected:data?.status==="connected",email:data?.email||null,status:data?.status||"disconnected"});
 }catch(e){return res.status(500).json({error:e instanceof Error?e.message:"Could not load Gmail connection status."});}
}
