import { createClient } from "@supabase/supabase-js";
import { cvProfiles } from "../../src/cv/profiles.js";
import { personalCandidate } from "../../src/profile/personal.js";
import { prepareApplication } from "../../src/application/package.js";
import { createApprovalItem } from "../../src/application/approval.js";

function client(){const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_PUBLISHABLE_KEY;if(!url||!key)throw new Error("Database is not configured.");return createClient(url,key,{auth:{persistSession:false}});}

function signalArray(value){return Array.isArray(value)?value.filter(x=>x&&typeof x.name==="string"):[];}
function normalizeFingerprint(value){
 const fp=value&&typeof value==="object"?value:{};
 return {
  ...fp,
  version:1,
  kind:"job",
  skills:signalArray(fp.skills),
  tools:signalArray(fp.tools),
  domains:signalArray(fp.domains),
  roles:signalArray(fp.roles),
  locations:Array.isArray(fp.locations)?fp.locations:[],
  remoteEligible:typeof fp.remoteEligible==="boolean"?fp.remoteEligible:false
 };
}
function errorPayload(error){
 if(error instanceof Error)return {error:error.message};
 if(error&&typeof error==="object"){
  const e=error;
  const message=[e.message,e.details,e.hint].filter(x=>typeof x==="string"&&x.trim()).join(" — ");
  return {error:message||"Application preparation failed.",...(typeof e.code==="string"?{code:e.code}:{})};
 }
 return {error:typeof error==="string"?error:"Application preparation failed."};
}

export default async function handler(req,res){
 if(req.method!=="POST")return res.status(405).json({error:"Method not allowed"});
 try{
  const body=typeof req.body==="string"?JSON.parse(req.body):req.body||{};
  if(!body.job_id)return res.status(400).json({error:"job_id is required"});
  const db=client();
  const {data:job,error}=await db.from("jobs").select("*").eq("id",body.job_id).single();
  if(error||!job)return res.status(404).json({error:"Job not found"});
  const normalized={id:job.id,title:job.title,company:job.company??undefined,description:job.description??"",url:job.url??"",location:job.location??undefined,remote:job.remote,source:job.source??"unknown",postedAt:job.posted_at??undefined,expiresAt:job.expires_at??undefined,fingerprint:normalizeFingerprint(job.raw?.fingerprint??job.fingerprint)};
  const pkg=prepareApplication(personalCandidate,cvProfiles,{job:normalized,finalScore:Number(job.score||0),rankReasons:Array.isArray(job.reasons)?job.reasons:[]});
  const approval=createApprovalItem(pkg);
  const status=pkg.truthReport.valid?"pending_approval":"rejected";
  const {data:application,error:saveError}=await db.from("applications").insert({job_id:job.id,status,cv_id:pkg.cv.cvId,cover_letter:pkg.coverLetter.content,answers:pkg.answers}).select("id,status,job_id,cv_id,created_at").single();
  if(saveError)throw saveError;
  return res.status(201).json({application,approvalId:approval.id,truthReport:pkg.truthReport,cv:pkg.cv,coverLetter:pkg.coverLetter,tailoredCV:pkg.tailoredCV});
 }catch(e){
  const payload=errorPayload(e);
  if(e&&typeof e==="object"&&!(e instanceof Error))console.error("Application preparation failed",payload);
  else console.error("Application preparation failed",payload.error);
  return res.status(422).json(payload);
 }
}
