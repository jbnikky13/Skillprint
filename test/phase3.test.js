import test from "node:test";
import assert from "node:assert/strict";
import { normalizeJob, deduplicateJobs, jobIsExpired, discoverJobs } from "../dist/jobs/index.js";
const raw={externalId:"1",title:"AI Data Annotator",company:"Example",description:"Remote worldwide role using Python and data annotation",url:"https://example.com/jobs/1",remote:true,source:"example"};
test("normalizes raw job into fingerprint",()=>{const j=normalizeJob(raw);assert.equal(j.status,"active");assert.equal(j.fingerprint.remoteEligible,true);assert.ok(j.fingerprint.roles.length>0);});
test("detects expired jobs",()=>{const j=normalizeJob({...raw,expiresAt:"2020-01-01T00:00:00Z"});assert.equal(j.status,"expired");assert.equal(jobIsExpired(j),true);});
test("deduplicates by source id or canonical URL",()=>{const a=normalizeJob(raw),b=normalizeJob({...raw,externalId:undefined,title:"Updated"});assert.equal(deduplicateJobs([a,b]).length,2);assert.equal(deduplicateJobs([a,{...a,title:"Updated"}]).length,1);});
test("discovers, normalizes and filters jobs while tolerating source failures",async()=>{const source={id:"test",name:"Test",scope:"global",async search(){return [raw]}};const broken={id:"broken",name:"Broken",scope:"remote",async search(){throw new Error("offline")}};const jobs=await discoverJobs([source,broken],{keywords:["AI"]});assert.equal(jobs.length,1);});
