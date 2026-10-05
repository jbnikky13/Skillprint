import type { ApplicationTask,AgentPolicy } from "./types.js";
import { evaluatePolicy } from "./policy.js";
export interface AutopilotRules{enabled:boolean;minimumScore:number;requireRemote?:boolean;blockedKeywords?:string[];requireApprovalForFirstApplication?:boolean;}
export interface AutopilotDecision{allowed:boolean;reasons:string[];}
export function evaluateAutopilot(task:ApplicationTask,rules:AutopilotRules,policy:AgentPolicy):AutopilotDecision{
 const reasons:string[]=[]; if(!rules.enabled)return{allowed:false,reasons:["Autopilot is disabled."]};
 const base=evaluatePolicy(task,policy); if(!base.allowed)reasons.push(...base.reasons);
 const score=(task.job as any).matchScore; if(typeof score==="number"&&score<rules.minimumScore)reasons.push("Job score is below the autopilot threshold.");
 if(rules.requireRemote&&!task.job.remote)reasons.push("Job is not remote.");
 const text=(task.job.title+" "+task.job.description).toLowerCase(); for(const word of rules.blockedKeywords??[])if(text.includes(word.toLowerCase()))reasons.push("Blocked keyword matched: "+word);
 if(rules.requireApprovalForFirstApplication&&task.attempts===0)reasons.push("First application requires approval.");
 return{allowed:reasons.length===0,reasons};
}
