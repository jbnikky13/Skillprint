import type { JobSource, JobSearchQuery, RawJob } from "../types.js";
export interface CompanyCareerPageOptions { id:string; name:string; careersUrl:string; parser:(html:string,url:string)=>RawJob[]; }
export function createCompanyCareerSource(options:CompanyCareerPageOptions):JobSource{
  return {id:options.id,name:options.name,scope:"global",async search(query:JobSearchQuery){
    const response=await fetch(options.careersUrl,{headers:{accept:"text/html,application/xhtml+xml"}});
    if(!response.ok)throw new Error(`${options.name} career page returned HTTP ${response.status}`);
    const html=await response.text();
    const jobs=options.parser(html,options.careersUrl);
    const terms=(query.keywords??[]).map(x=>x.toLowerCase());
    return terms.length?jobs.filter(j=>terms.some(t=>`${j.title} ${j.description}`.toLowerCase().includes(t))):jobs;
  }};
}
