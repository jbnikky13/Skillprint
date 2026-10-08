import type {ApplicationTask,AgentPolicy} from "./types.js";import {createATSAdapters,detectATS,verifyATSSubmission, type ATSName} from "./ats.js";import type {BrowserFactory} from "./browser.js";import {evaluateExecution} from "./execution-policy.js";
export interface ExecutionReport{decision:"PREPARED"|"SUBMITTED"|"BLOCKED"|"FAILED";ats?:ATSName;verified:boolean;message:string}
export async function executeApplication(task:ApplicationTask,policy:AgentPolicy,browsers:BrowserFactory):Promise<ExecutionReport>{
 const decision=evaluateExecution(task,policy),ats=decision.ats as ATSName|undefined;if(decision.decision!=="REQUIRE_APPROVAL")return {decision:"BLOCKED",ats,verified:false,message:decision.reason};
 if(task.mode!=="approval"||task.state!=="approved")return {decision:"BLOCKED",ats,verified:false,message:"Explicit application approval is required."};
 if(!ats)return {decision:"BLOCKED",verified:false,message:"Unsupported ATS."};
 const adapter=createATSAdapters().find(x=>x.name===ats);if(!adapter)return {decision:"BLOCKED",ats,verified:false,message:"No adapter available."};
 const browser=await browsers.open();try{const prepared=await adapter.run(task,browser);if(!("prepared" in prepared)||!prepared.prepared)return {decision:"FAILED",ats,verified:false,message:prepared.message??"Preparation failed."};
 return {decision:"PREPARED",ats,verified:false,message:"Application prepared. Browser remains open only for the approved execution flow."};
 }finally{await browser.close();}
}
export function verifyExecutionConfirmation(ats:ATSName,text:string){return verifyATSSubmission(ats,text);}
