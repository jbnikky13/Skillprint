import type { ApplicationPackage } from "../application/types.js";
import type { NormalizedJob } from "../jobs/types.js";
import { evaluatePolicy, DEFAULT_AGENT_POLICY } from "./policy.js";
import type { AgentPolicy, ApplicationBrowser, ApplicationSubmission, ApplicationTask, AgentMode } from "./types.js";
import { audit, type AuditRecord } from "./audit.js";
import { RateLimiter } from "./rate-limit.js";
import { DEFAULT_SITE_RULES, ruleFor, type SiteRule } from "./site-rules.js";
import { WorkflowRegistry, createGenericWorkflow } from "./workflows.js";

export class ApplicationAgent {
  private readonly limiter: RateLimiter;
  private readonly registry: WorkflowRegistry;
  constructor(private readonly policy: AgentPolicy = DEFAULT_AGENT_POLICY, siteRules: SiteRule[] = DEFAULT_SITE_RULES) {
    this.limiter = new RateLimiter(policy.maxApplicationsPerRun, 60 * 60 * 1000);
    this.registry = new WorkflowRegistry();
    this.registry.register(createGenericWorkflow());
    this.siteRules = siteRules;
  }
  private readonly siteRules: SiteRule[];

  createTask(job: NormalizedJob, pkg: ApplicationPackage, mode: AgentMode = "approval"): ApplicationTask {
    return { id:"task-"+job.id+"-"+Date.now(), job, package:pkg, mode, state:mode==="manual"?"ready":"awaiting_approval", createdAt:new Date().toISOString(), attempts:0 };
  }
  approveTask(task: ApplicationTask): ApplicationTask {
    if (task.mode === "approval" && task.state === "awaiting_approval") task.state = "approved";
    return task;
  }
  rejectTask(task: ApplicationTask): ApplicationTask {
    if (task.state === "awaiting_approval" || task.state === "approved") task.state = "blocked";
    return task;
  }
  plan(task: ApplicationTask): AuditRecord[] {
    const decision=evaluatePolicy(task,this.policy);
    if(!decision.allowed){task.state="blocked";return[audit(task,"blocked",decision.reasons.join(" "))];}
    const rule=ruleFor(task.job.url,this.siteRules);
    if(rule?.allowed===false){task.state="blocked";return[audit(task,"blocked","Site is blocked by site rules.")];}
    return [audit(task,"policy_checked","Application passed agent policy.")];
  }
  async execute(task: ApplicationTask,browser:ApplicationBrowser):Promise<{submission:ApplicationSubmission;audit:AuditRecord[]}> {
    const decision=evaluatePolicy(task,this.policy);
    if(!decision.allowed){task.state="blocked";return{submission:{accepted:false,message:decision.reasons.join(" ")},audit:[audit(task,"blocked",decision.reasons.join(" "))]};}
    if(task.mode==="approval"&&task.state!=="approved"){task.state="awaiting_approval";return{submission:{accepted:false,message:"Approval is required before submission."},audit:[audit(task,"approval_required")]};}
    if(task.mode==="autonomous"&&!this.policy.allowedModes.includes("autonomous")){task.state="blocked";return{submission:{accepted:false,message:"Autonomous mode is disabled by policy."},audit:[audit(task,"blocked","Autonomous mode is disabled.") ]};}
    const rule=ruleFor(task.job.url,this.siteRules);
    if(rule?.allowed===false){task.state="blocked";return{submission:{accepted:false,message:"Site is blocked by site rules."},audit:[audit(task,"blocked","Site is blocked by site rules.")]};}
    if(rule?.requireApproval && task.state!=="approved"){task.state="awaiting_approval";return{submission:{accepted:false,message:"Site rule requires approval."},audit:[audit(task,"approval_required","Site rule requires approval.")]};}
    if(!this.limiter.allow()){task.state="blocked";return{submission:{accepted:false,message:"Rate limit reached."},audit:[audit(task,"blocked","Rate limit reached.")]};}
    task.attempts++; task.state="ready";
    try {
      const workflow=this.registry.resolve(task);
      if(!workflow){task.state="failed";return{submission:{accepted:false,message:"No compatible application workflow."},audit:[audit(task,"failed","No compatible application workflow.")]};}
      const result=await workflow.run(task,browser);
      task.state=result.accepted?"submitted":"failed";
      return{submission:result,audit:[audit(task,"opened",task.job.url),audit(task,result.accepted?"submitted":"failed",result.message)]};
    } catch(error) {
      task.state="failed";
      return{submission:{accepted:false,message:error instanceof Error?error.message:String(error)},audit:[audit(task,"failed",String(error))]};
    }
  }
  registerWorkflow(workflow: import("./types.js").ApplicationWorkflow): void { this.registry.register(workflow); }
}
