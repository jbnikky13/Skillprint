import type { JobSource, JobSearchQuery, RawJob } from "../types.js";
export interface HttpJobSourceOptions { id:string; name:string; scope:JobSource["scope"]; endpoint:string; headers?:Record<string,string>; map:(payload:unknown)=>RawJob[]; }
export function createHttpJobSource(options:HttpJobSourceOptions):JobSource{
  return {id:options.id,name:options.name,scope:options.scope,async search(query:JobSearchQuery){
    const url=new URL(options.endpoint);
    if(query.keywords?.length)url.searchParams.set("q",query.keywords.join(" "));
    if(query.locations?.length)url.searchParams.set("location",query.locations.join(","));
    if(query.remoteOnly)url.searchParams.set("remote","true");
    if(query.limit)url.searchParams.set("limit",String(query.limit));
    const response=await fetch(url,{headers:options.headers});
    if(!response.ok)throw new Error(`${options.name} returned HTTP ${response.status}`);
    return options.map(await response.json());
  }};
}
