import type {ApplicationBrowser,ApplicationSubmission,ApplicationTask,ApplicationWorkflow} from "./types.js";
import type {NormalizedJob} from "../jobs/types.js";

export type ATSName="greenhouse"|"lever"|"workday";
export interface ATSExecutionResult extends ApplicationSubmission{ats:ATSName;prepared:boolean;verified:boolean;requiresApproval:boolean;}
export interface ATSAdapter extends ApplicationWorkflow{name:ATSName;detect(url:string):boolean;verifyConfirmation(text:string):boolean;}

const defs:{name:ATSName;hosts:RegExp[];confirm:RegExp[]}[]=[
{name:"greenhouse",hosts:[/(^|\.)greenhouse\.io$/],confirm:[/thank you/i,/application (?:was )?submitted/i,/successfully submitted/i]},
{name:"lever",hosts:[/(^|\.)lever\.co$/],confirm:[/thank you/i,/application (?:was )?submitted/i,/successfully submitted/i]},
{name:"workday",hosts:[/(^|\.)myworkdayjobs\.com$/],confirm:[/thank you/i,/application (?:was )?submitted/i,/successfully submitted/i]}
];
const host=(url:string)=>{try{return new URL(url).hostname.toLowerCase()}catch{return ""}};
export function detectATS(url:string):ATSName|undefined{const h=host(url);return defs.find(d=>d.hosts.some(r=>r.test(h)))?.name;}
export function createATSAdapters():ATSAdapter[]{return defs.map(d=>({name:d.name,detect:(url)=>{const h=host(url);return d.hosts.some(r=>r.test(h));},canHandle:(job:NormalizedJob)=>d.hosts.some(r=>r.test(host(job.url))),verifyConfirmation:(text)=>d.confirm.some(r=>r.test(text)),async run(task,browser):Promise<ATSExecutionResult>{await browser.open(task.job.url);return {accepted:false,ats:d.name,prepared:true,verified:false,requiresApproval:true,message:"ATS form opened. Review all fields and explicitly approve submission before execution."};}}));}
export function verifyATSSubmission(ats:ATSName,text:string):boolean{const d=defs.find(x=>x.name===ats);return !!d?.confirm.some(r=>r.test(text));}
