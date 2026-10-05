import test from "node:test";
import assert from "node:assert/strict";
import { RateLimiter, ruleFor, createGenericWorkflow } from "../dist/agent/index.js";
test("rate limiter caps applications",()=>{const r=new RateLimiter(2,60000);assert.equal(r.allow(1000),true);assert.equal(r.allow(1001),true);assert.equal(r.allow(1002),false);});
test("site rules match subdomains",()=>{assert.equal(ruleFor("https://jobs.example.com/app",[{host:"example.com",allowed:true}])?.allowed,true);});
test("generic workflow refuses blind submission",async()=>{let clicks=0;const workflow=createGenericWorkflow();const job={id:"x",title:"x",description:"x",url:"https://example.com",source:"x",discoveredAt:new Date().toISOString(),status:"active",fingerprint:{version:1,kind:"job",title:"x",skills:[],tools:[],domains:[],roles:[],locations:[],remoteEligible:true,remoteScope:"worldwide"}};const task={id:"t",job,package:{},mode:"manual",state:"ready",createdAt:new Date().toISOString(),attempts:0};const result=await workflow.run(task,{open:async()=>{},fill:async()=>{},upload:async()=>{},click:async()=>{clicks++},submit:async()=>{}});assert.equal(result.accepted,false);assert.equal(clicks,1);});
