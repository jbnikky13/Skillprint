import type {AgentPolicy,ApplicationTask} from "./types.js";
import {detectATS} from "./ats.js";
export type ExecutionDecision="ALLOW_PREPARE"|"REQUIRE_APPROVAL"|"BLOCK";
export function evaluateExecution(task:ApplicationTask,policy:AgentPolicy):{decision:ExecutionDecision;reason:string;ats?:string}{
 const ats=detectATS(task.job.url);
 if(task.state!=="approved"&&task.mode!=="manual")return {decision:"REQUIRE_APPROVAL",reason:"Application is not explicitly approved." ,ats};
 if(!ats&&policy.requireApprovalForUnknownSites)return {decision:"REQUIRE_APPROVAL",reason:"Unknown application site.",ats};
 if(task.attempts>=policy.maxApplicationsPerRun)return {decision:"BLOCK",reason:"Application attempt limit reached.",ats};
 if(task.job.status==="expired"&&policy.respectJobExpiration)return {decision:"BLOCK",reason:"Job is expired.",ats};
 const score=task.job.matchScore??0;if(score<policy.minMatchScore)return {decision:"BLOCK",reason:"Job match score is below policy threshold.",ats};
 return {decision:"REQUIRE_APPROVAL",reason:"Browser submission requires explicit approval and post-submit verification.",ats};
}
