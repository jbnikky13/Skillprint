import test from "node:test";import assert from "node:assert/strict";import {detectATS,verifyATSSubmission} from "../dist/agent/ats.js";import {evaluateExecution} from "../dist/agent/execution-policy.js";
const job={id:"j",title:"Data Annotator",company:"Acme",description:"",url:"https://boards.greenhouse.io/acme/jobs/1",status:"active",matchScore:90,fingerprint:{},discoveredAt:new Date().toISOString()};
const task={id:"t",job,package:{},mode:"approval",state:"approved",createdAt:new Date().toISOString(),attempts:0};
const policy={maxApplicationsPerRun:5,minMatchScore:70,minTruthConfidence:.8,allowedModes:["approval"],requireApprovalForUnknownSites:true,respectJobExpiration:true};
test("detects supported ATS",()=>{assert.equal(detectATS(job.url),"greenhouse");assert.equal(detectATS("https://example.com/job"),undefined)});
test("never auto-submits ATS forms",()=>{const d=evaluateExecution(task,policy);assert.equal(d.decision,"REQUIRE_APPROVAL")});
test("requires explicit confirmation text",()=>{assert.equal(verifyATSSubmission("greenhouse","Application successfully submitted"),true);assert.equal(verifyATSSubmission("greenhouse","Please complete your profile"),false)});
