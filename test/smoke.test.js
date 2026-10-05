import test from "node:test";
import assert from "node:assert/strict";
import { createFingerprint, matchFingerprints } from "../dist/index.js";

test("public API smoke path creates fingerprints and returns a match",()=>{
 const candidate=createFingerprint({kind:"candidate",skills:["AI evaluation"],domains:["AI"],roles:["AI evaluator"],locations:["Nigeria"],remoteEligible:true,remoteScope:"worldwide"});
 const job=createFingerprint({kind:"job",skills:["AI evaluation"],domains:["AI"],roles:["AI evaluator"],remoteEligible:true,remoteScope:"worldwide"});
 const result=matchFingerprints(candidate,job);
 assert.ok(candidate.id); assert.ok(job.id); assert.equal(result.eligible,true); assert.ok(result.score>50);
});
