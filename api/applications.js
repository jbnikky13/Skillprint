import { createClient } from "@supabase/supabase-js";

function db(){const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_PUBLISHABLE_KEY;if(!url||!key)throw new Error("Database is not configured.");return createClient(url,key,{auth:{persistSession:false}});}
export default async function handler(req,res){
 const supabase=db();
 if(req.method==="GET"){const {data,error}=await supabase.from("applications").select("id,job_id,status,cv_id,cover_letter,answers,submitted_at,created_at,updated_at,jobs(title,company,url,score,recommended_cv_id)").order("created_at",{ascending:false});if(error)return res.status(500).json({error:error.message});return res.status(200).json({applications:data||[]});}
 if(req.method==="POST"){const body=typeof req.body==="string"?JSON.parse(req.body):req.body||{};if(!body.job_id)return res.status(400).json({error:"job_id is required"});const {data,error}=await supabase.from("applications").insert({job_id:body.job_id,status:body.status||"draft",cv_id:body.cv_id||null,cover_letter:body.cover_letter||null,answers:body.answers||[]}).select().single();if(error)return res.status(400).json({error:error.message});return res.status(201).json(data);}
 return res.status(405).json({error:"Method not allowed"});
}