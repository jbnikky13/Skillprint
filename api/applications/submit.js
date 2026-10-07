import { createClient } from "@supabase/supabase-js";
function db(){const u=process.env.SUPABASE_URL,k=process.env.SUPABASE_PUBLISHABLE_KEY;if(!u||!k)throw new Error("Database is not configured.");return createClient(u,k,{auth:{persistSession:false}});}
export default async function handler(req,res){
 if(req.method!=="POST")return res.status(405).json({error:"Method not allowed"});
 try{
  const body=typeof req.body==="string"?JSON.parse(req.body):req.body||{};if(!body.id)return res.status(400).json({error:"id is required"});
  const s=db();const {data:app,error}=await s.from("applications").select("id,status,jobs(title,company,url)").eq("id",body.id).single();if(error||!app)return res.status(404).json({error:"Application not found"});
  if(app.status!=="approved")return res.status(409).json({error:"Only approved applications can enter submission."});
  return res.status(200).json({ready:true,requiresInteractiveSubmission:true,message:"Application approved. Open the job site and complete the external form. Skillprint will not claim submission until the site confirms it.",job:app.jobs});
 }catch(e){return res.status(500).json({error:e instanceof Error?e.message:String(e)});}
}