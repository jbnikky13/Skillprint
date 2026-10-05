import test from "node:test";
import assert from "node:assert/strict";
import { rankOpportunities, scamRisk, retrieveByVector } from "../dist/ranking/index.js";

const signal=(name, requirement="preferred")=>({name,weight:1,evidence:"demonstrated",requirement});
const candidate={version:1,kind:"candidate",title:"Developer",skills:[signal("python")],tools:[signal("typescript")],domains:[signal("ai")],roles:[signal("software-developer")],locations:["Nigeria"],remoteEligible:true};
const job=(title,description,remoteScope="worldwide")=>({id:title,fingerprint:{version:1,kind:"job",title,skills:[signal("python","required")],tools:[signal("typescript")],domains:[signal("ai")],roles:[signal("software-developer")],locations:[],remoteEligible:true,remoteScope},title,description,url:"https://example.com/job",company:"Example",source:"test",discoveredAt:new Date().toISOString(),status:"active"});

test("phase 4 ranks eligible opportunities",async()=>{const jobs=[job("Strong","Build Python AI software"),job("Weak","Different role")];const ranked=await rankOpportunities(candidate,jobs);assert.equal(ranked.length,2);assert.ok(ranked[0].finalScore>=ranked[1].finalScore);});
test("scam signals lower safety",()=>{assert.ok(scamRisk(job("Safe","Build software"))<scamRisk(job("Guaranteed job","Pay a fee and send your password")));});
test("vector retrieval orders by cosine similarity",async()=>{const jobs=[job("A","A"),job("B","B")];const vectors=new Map([["Developer",[1,0]],["A",[1,0]],["B",[0,1]]]);const result=await retrieveByVector(candidate,jobs,{embed:async(text)=>vectors.get(text.split(" | ")[0]) ?? [0,1]},2);assert.equal(result.length,2);assert.equal(result[0].job.title,"A");});
