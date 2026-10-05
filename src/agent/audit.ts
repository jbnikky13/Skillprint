import type { ApplicationTask, AgentMode, ApplicationState } from "./types.js";

export type AuditEvent = "created" | "policy_checked" | "approval_required" | "opened" | "filled" | "submitted" | "failed" | "blocked";

export interface AuditRecord {
  taskId: string;
  event: AuditEvent;
  mode: AgentMode;
  state: ApplicationState;
  timestamp: string;
  detail?: string;
}

export function audit(task: ApplicationTask,event:AuditEvent,detail?:string):AuditRecord {
  return {taskId:task.id,event,mode:task.mode,state:task.state,timestamp:new Date().toISOString(),detail};
}
