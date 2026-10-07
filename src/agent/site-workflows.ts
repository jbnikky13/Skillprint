import type { ApplicationBrowser, ApplicationSubmission, ApplicationTask, ApplicationWorkflow } from "./types.js";

function hostMatches(url:string, patterns:RegExp[]):boolean{try{return patterns.some(p=>p.test(new URL(url).hostname.toLowerCase()));}catch{return false;}}
function value(task:ApplicationTask,key:string):string|undefined{
 const pkg=task.package as any;
 if(key==="name") return pkg.candidate?.name ?? (pkg.candidate?.firstName&&pkg.candidate?.lastName ? pkg.candidate.firstName+" "+pkg.candidate.lastName : undefined);
 if(key==="email") return pkg.candidate?.email;
 if(key==="phone") return pkg.candidate?.phone;
 return undefined;
}
function adapter(name:string,patterns:RegExp[],fields:string[]):ApplicationWorkflow{
 return {name,canHandle:job=>hostMatches(job.url,patterns),async run(task,browser):Promise<ApplicationSubmission>{
   await browser.open(task.job.url);
   for(const field of fields){const v=value(task,field);if(v) await browser.fill(field,v);}
   return {accepted:false,message:name+" application page prepared. Review fields and submit manually; Skillprint will not claim submission without site confirmation."};
 }};
}
export const greenhouseWorkflow=()=>adapter("greenhouse",[/(^|\.)greenhouse\.io$/],["name","email","phone"]);
export const leverWorkflow=()=>adapter("lever",[/(^|\.)lever\.co$/],["name","email","phone"]);
export const workdayWorkflow=()=>adapter("workday",[/(^|\.)myworkdayjobs\.com$/,/workday/i],["name","email","phone"]);
export function createSiteWorkflowRegistry(){return [greenhouseWorkflow(),leverWorkflow(),workdayWorkflow()];}
