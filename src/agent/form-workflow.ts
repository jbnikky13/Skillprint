import type {ApplicationBrowser,ApplicationSubmission,ApplicationTask,ApplicationWorkflow} from "./types.js";
import type {NormalizedJob} from "../jobs/types.js";
export interface FormField{selector:string;value:(task:ApplicationTask)=>string|undefined;required?:boolean;}
export interface FormWorkflowConfig{name:string;hostPatterns:RegExp[];fields:FormField[];submitSelector:string;}
export function createConfiguredFormWorkflow(config:FormWorkflowConfig):ApplicationWorkflow{
 return {
  name:config.name,
  canHandle(job:NormalizedJob){try{const host=new URL(job.url).hostname;return config.hostPatterns.some(p=>p.test(host));}catch{return false;}},
  async run(task:ApplicationTask,browser:ApplicationBrowser):Promise<ApplicationSubmission>{
   await browser.open(task.job.url);
   for(const field of config.fields){
    const value=field.value(task);
    if(value===undefined||value===""){if(field.required)return{accepted:false,message:"Required application field is unavailable: "+field.selector};continue;}
    await browser.fill(field.selector,value);
   }
   await browser.click(config.submitSelector);
   await browser.submit();
   return {accepted:true,message:"Application submitted through configured workflow."};
  }
 };
}
