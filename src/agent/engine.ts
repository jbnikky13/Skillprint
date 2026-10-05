import type { ApplicationPackage } from "../application/types.js";
import type { NormalizedJob } from "../jobs/types.js";
import { evaluatePolicy, DEFAULT_AGENT_POLICY } from "./policy.js";
import type { AgentPolicy, ApplicationBrowser, ApplicationSubmission, ApplicationTask, AgentMode } from "./types.js";
import { audit, type AuditRecord } from "./audit.js";

export class ApplicationAgent {
  constructor(private readonly policy: AgentPolicy = DEFAULT_AGENT_POLICY) {}

  createTask(job: NormalizedJob, pkg: ApplicationPackage, mode: AgentMode = "approval"): ApplicationTask {
    const task: ApplicationTask = { id: "task-"+job.id+"-"+Date.now(), job, package:pkg, mode, state: mode==="manual" ? "ready" : "awaiting_approval", createdAt:new Date().toISOString(), attempts:0 };
    return task;
  }

  plan(task: ApplicationTask): AuditRecord[] {
    const decision=evaluatePolicy(task,this.policy);
    if(!decision.allowed) { task.state="blocked"; return [audit(task,"blocked",decision.reasons.join(" "))]; }
    return [audit(task,"policy_checked","Application passed agent policy.")];
  }

  async execute(task: ApplicationTask,browser:ApplicationBrowser):Promise<{submission:ApplicationSubmission;audit:AuditRecord[]}> {
    const decision=evaluatePolicy(task,this.policy);
    if(!decision.allowed) { task.state="blocked"; return {submission:{accepted:false,message:decision.reasons.join(" ")},audit:[audit(task,"blocked",decision.reasons.join(" "))]}; }
    if(task.mode==="approval" && task.state!=="approved" as never) {
      task.state="awaiting_approval";
      return {submission:{accepted:false,message:"Approval is required before submission."},audit:[audit(task,"approval_required")]};
    }
    if(task.mode==="autonomous" && !this.policy.allowedModes.includes("autonomous")) {
      task.state="blocked";
      return {submission:{accepted:false,message:"Autonomous mode is disabled by policy."},audit:[audit(task,"blocked","Autonomous mode is disabled.") ]};
    }
    task.attempts+=1; task.state="ready";
    try {
      await browser.open(task.job.url);
      const result=await this.executeWorkflow(task,browser);
      task.state=result.accepted?"submitted":"failed";
      return {submission:result,audit:[audit(task,"opened",task.job.url),audit(task,result.accepted?"submitted":"failed",result.message)]};
    } catch(error) {
      task.state="failed";
      return {submission:{accepted:false,message:error instanceof Error?error.message:String(error)},audit:[audit(task,"failed",String(error))]};
    }
  }

  private async executeWorkflow(task:ApplicationTask,browser:ApplicationBrowser):Promise<ApplicationSubmission>{
    await browser.click("application-form");
    return {accepted:false,message:"No site-specific workflow is registered."};
  }
}
