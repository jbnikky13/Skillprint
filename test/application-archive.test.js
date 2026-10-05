import test from "node:test";
import assert from "node:assert/strict";
import { ApplicationArchive } from "../dist/application/index.js";
const pkg={job:{id:"job-a",title:"AI Evaluator",company:"Example",url:"https://example.com/app"},cv:{cvId:"cv-ai"},tailoredCV:{cvId:"cv-ai",jobId:"job-a",headline:"AI Evaluator",selectedSkills:["AI"],selectedEvidence:["portfolio"],changes:["targeted"]},coverLetter:{content:"Hello",claims:["AI"]},answers:[{question:"Remote?",answer:"Yes",claims:["remote"],confidence:1}],truthReport:{valid:true,unsupportedClaims:[],contradictions:[],warnings:[]}};
test("archive preserves a copy of a submitted application",()=>{const a=new ApplicationArchive();const r=a.save(pkg,{accepted:true,externalId:"ext-1",message:"submitted"});assert.equal(r.status,"submitted");assert.equal(r.cvId,"cv-ai");assert.equal(r.coverLetter,"Hello");assert.equal(r.answers[0].answer,"Yes");assert.equal(a.list().length,1);});
test("archive returns copies rather than mutable records",()=>{const a=new ApplicationArchive();const r=a.save(pkg,{accepted:true});r.coverLetter="changed";assert.equal(a.get(r.id).coverLetter,"Hello");});
