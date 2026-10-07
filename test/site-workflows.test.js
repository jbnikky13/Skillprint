import test from "node:test";
import assert from "node:assert/strict";
import { createSiteWorkflowRegistry } from "../dist/agent/site-workflows.js";

const job=(url)=>({id:"1",title:"Test",description:"",url,remote:true,source:"test"});
const task={id:"a",job:job("https://boards.greenhouse.io/acme/jobs/1"),package:{},mode:"approval",state:"approved",createdAt:new Date().toISOString(),attempts:0};

test("recognizes supported ATS hosts",()=>{
 const workflows=createSiteWorkflowRegistry();
 assert.equal(workflows.length,3);
 assert.ok(workflows.find(w=>w.canHandle(job("https://boards.greenhouse.io/acme/jobs/1"))));
 assert.ok(workflows.find(w=>w.canHandle(job("https://jobs.lever.co/acme/1"))));
 assert.ok(workflows.find(w=>w.canHandle(job("https://acme.myworkdayjobs.com/en-US/careers/job/1"))));
});
