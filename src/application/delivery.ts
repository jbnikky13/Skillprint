import type { ApplicationBrowser, ApplicationTask, ApplicationSubmission } from "../agent/types.js";

export interface ApplicationDelivery {
  name:string;
  canHandle(task:ApplicationTask):boolean;
  submit(task:ApplicationTask,browser:ApplicationBrowser):Promise<ApplicationSubmission>;
}

export class DeliveryRegistry {
  private deliveries:ApplicationDelivery[]=[];
  register(delivery:ApplicationDelivery):void{this.deliveries.push(delivery);}
  resolve(task:ApplicationTask):ApplicationDelivery|undefined{return this.deliveries.find(x=>x.canHandle(task));}
}

export function browserDelivery():ApplicationDelivery{
  return {
    name:"browser",
    canHandle:task=>Boolean(task.job.url),
    async submit(task,browser){
      await browser.open(task.job.url);
      const result=await browser.click("application-form").then(()=>({accepted:false,message:"Site workflow required before submission."})).catch(error=>({accepted:false,message:error instanceof Error?error.message:String(error)}));
      return result;
    }
  };
}
