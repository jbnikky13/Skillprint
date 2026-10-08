import type { ApplicationBrowser, ApplicationTask, ApplicationWorkflow, ApplicationSubmission } from "./types.js";

export class WorkflowRegistry {
  private readonly workflows: ApplicationWorkflow[] = [];
  register(workflow: ApplicationWorkflow): void { this.workflows.unshift(workflow); }
  resolve(task: ApplicationTask): ApplicationWorkflow | undefined {
    return this.workflows.find(w => w.canHandle(task.job));
  }
}

/** Generic fallback should remain last; registered site-specific workflows take precedence. */
export function createGenericWorkflow(): ApplicationWorkflow {
  return {
    name: "generic",
    canHandle: (job) => Boolean(job.url),
    async run(task, browser): Promise<ApplicationSubmission> {
      await browser.open(task.job.url);
      await browser.click("application-form");
      return { accepted: false, message: "Generic form detected but field mapping is not registered; manual review required." };
    }
  };
}
