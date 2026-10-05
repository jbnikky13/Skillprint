import test from "node:test";import assert from "node:assert/strict";
import {PLANS,DEFAULT_PRIVACY,canDiscover,visibleCandidateFields,canUseApi,APIKeyRegistry,searchCandidates} from "../dist/product/index.js";
test("plans enforce product capabilities",()=>{assert.equal(PLANS.free.apiAccess,false);assert.equal(PLANS.pro.apiAccess,true);});
test("privacy defaults to private",()=>{assert.equal(DEFAULT_PRIVACY.profileVisibility,"private");assert.equal(canDiscover(DEFAULT_PRIVACY),false);assert.deepEqual(visibleCandidateFields(DEFAULT_PRIVACY,"recruiter"),[]);});
test("billing gates API access",()=>{assert.equal(canUseApi({accountId:"a",planId:"pro",status:"active"}),true);assert.equal(canUseApi({accountId:"a",planId:"pro",status:"cancelled"}),false);});
test("API keys can be issued and revoked",()=>{const r=new APIKeyRegistry();const k=r.issue("a","test");assert.ok(r.resolve(k.prefix)===undefined);assert.ok(k.id);r.revoke(k.id);});
test("recruiter search is permission bounded",async()=>{const source={search:async()=>[{candidateId:"c",headline:"AI evaluator",skills:["Python"],roles:["AI evaluator"],domains:["AI"],remoteEligible:true}]};const out=await searchCandidates(source,{query:"AI evaluator"},{canViewProfile:true,canViewEvidence:false,canContact:false});assert.equal(out.length,1);});
