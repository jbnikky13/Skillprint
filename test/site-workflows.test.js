import test from "node:test";
import assert from "node:assert/strict";
import { createSiteWorkflowRegistry, detectSubmissionConfirmation, getSiteProfile } from "../dist/agent/site-workflows.js";
test("detects ATS profiles",()=>{assert.equal(getSiteProfile("https://boards.greenhouse.io/acme/jobs/1")?.name,"Greenhouse");assert.equal(getSiteProfile("https://jobs.lever.co/acme/1")?.name,"Lever");assert.equal(getSiteProfile("https://acme.myworkdayjobs.com/en-US/careers/job/1")?.name,"Workday");});
test("requires confirmation text",()=>{assert.equal(detectSubmissionConfirmation("Greenhouse","Thank you, your application was submitted."),true);assert.equal(detectSubmissionConfirmation("Greenhouse","Please review your application."),false);});
test("registry has supported adapters",()=>assert.equal(createSiteWorkflowRegistry().length,3));
