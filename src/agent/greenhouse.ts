import type {ApplicationBrowser,ApplicationSubmission,ApplicationTask} from "./types.js";
export type GreenhouseFieldKind="name"|"email"|"phone"|"location"|"resume"|"cover_letter"|"unknown";
export interface GreenhouseField{label:string;selector:string;kind:GreenhouseFieldKind;required:boolean;value?:string}
const rules:[RegExp,GreenhouseFieldKind][]=[
[/first\s*name/i,"name"],[/last\s*name/i,"name"],[/e-?mail/i,"email"],[/phone|mobile/i,"phone"],[/location|city|country/i,"location"],[/resume|cv/i,"resume"],[/cover\s*letter/i,"cover_letter"]];
export function classifyGreenhouseField(label:string):GreenhouseFieldKind{return rules.find(([r])=>r.test(label))?.[1]??"unknown";}
export function planGreenhouseFields(fields:Array<{label:string;selector:string;required?:boolean}>):{fields:GreenhouseField[];blocked:string[]}{const out:GreenhouseField[]=[],blocked:string[]=[];for(const f of fields){const kind=classifyGreenhouseField(f.label);const x={...f,kind,required:!!f.required};if(kind==="unknown"&&x.required)blocked.push(f.label);out.push(x)}return{fields:out,blocked};}
export async function prepareGreenhouse(task:ApplicationTask,browser:ApplicationBrowser):Promise<ApplicationSubmission>{await browser.open(task.job.url);return{accepted:false,message:"Greenhouse opened. Inspect required fields and request explicit approval before any submission.",};}
