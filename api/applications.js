import { createClient } from "@supabase/supabase-js";

function db(){const u=process.env.SUPABASE_URL,k=process.env.SUPABASE_PUBLISHABLE_KEY;if(!u||!k)throw new Error("Database is not configured.");return createClient(u,k,{auth:{persistSession:false}});}
export default async function handler(req,res){
 if(req.method==="GET"){
  try{const s=db();const {data,error}=await s.from("applications").select("id,job_id,status,cv_id,cover_letter,answers,submitted_at,created_at,updated_at,jobs(title,company,url,score,recommended_cv_id)").order("created_at",{ascending:false});if(error)throw error;return res.status(200).json({applications:data||[]});}catch(e){return res.status(500).json({error:e instanceof Error?e.message:String(e)});}
 }
 if(req.method!=="PATCH")return res.status(405).json({error:"Method not allowed"});
 try{
  const body=typeof req.body==="string"?JSON.parse(req.body):req.body||{};const id=body.id;if(!id)return res.status(400).json({error:"id is required"});
  const allowed=["pending_approval","approved","rejected","withdrawn"];if(!allowed.includes(body.status))return res.status(400).json({error:"Invalid application status"});
  const s=db();const {data:app,error:getError}=await s.from("applications").select("id,status").eq("id",id).single();if(getError||!app)return res.status(404).json({error:"Application not found"});
  if(body.status==="approved"&&app.status!=="pending_approval")return res.status(409).json({error:"Only pending applications can be approved."});
  if(body.status==="rejected"&&app.status!=="pending_approval")return res.status(409).json({error:"Only pending applications can be rejected."});
  const {data,error}=await s.from("applications").update({status:body.status,updated_at:new Date().toISOString()}).eq("id",id).select().single();if(error)throw error;return res.status(200).json(data);
 }catch(e){return res.status(422).json({error:e instanceof Error?e.message:String(e)});}
}