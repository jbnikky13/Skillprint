import type { ApplicationBrowser, ApplicationSubmission, ApplicationTask, ApplicationWorkflow } from "./types.js";
type SiteProfile={name:string;hosts:RegExp[];fields:string[];confirmation:RegExp[]};
const sites:SiteProfile[]=[
 {name:"Greenhouse",hosts:[/(^|\.)greenhouse\.io$/],fields:["name","email","phone"],confirmation:[/thank you/i,/application (?:was )?submitted/i,/successfully submitted/i]},
 {name:"Lever",hosts:[/(^|\.)lever\.co$/],fields:["name","email","phone"],confirmation:[/thank you/i,/application (?:was )?submitted/i,/successfully submitted/i]},
 {name:"Workday",hosts:[/(^|\.)myworkdayjobs\.com$/],fields:["name","email","phone"],confirmation:[/thank you/i,/application (?:was )?submitted/i,/successfully submitted/i]}
];
function hostMatches(url:string,p:RegExp[]){try{return p.some(x=>x.test(new URL(url).hostname.toLowerCase()));}catch{return false;}}
function candidateValue(task:ApplicationTask,key:string){const c=(task.package as any)?.candidate;if(!c)return;return key==="name"?(c.name ?? ([c.firstName,c.lastName].filter(Boolean).join(" ") || undefined)):c[key];}
export function createSiteWorkflowRegistry():ApplicationWorkflow[]{return sites.map(site=>({name:site.name,canHandle:job=>hostMatches(job.url,site.hosts),async run(task,browser):Promise<ApplicationSubmission>{await browser.open(task.job.url);for(const field of site.fields){const v=candidateValue(task,field);if(v)await browser.fill(field,v);}return {accepted:false,message:site.name+" form prepared. Submission requires explicit review and site confirmation."};}}));}
export function detectSubmissionConfirmation(siteName:string,text:string):boolean{const site=sites.find(s=>s.name===siteName);return !!site&&site.confirmation.some(r=>r.test(text));}
export function getSiteProfile(url:string){return sites.find(s=>hostMatches(url,s.hosts))??null;}
