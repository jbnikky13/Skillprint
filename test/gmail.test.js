import test from "node:test";import assert from "node:assert/strict";import {classifyGmailMessage,createGmailState,verifyGmailState} from "../dist/product/gmail.js";
const m=(subject,body="")=>({id:"1",headers:{subject},snippet:"",bodyText:body});
test("classifies application confirmations",()=>assert.equal(classifyGmailMessage(m("Application received","Thank you for applying")),"application_received"));
test("classifies interviews",()=>assert.equal(classifyGmailMessage(m("Interview invitation","We would like to interview you")),"interview"));
test("classifies offers before interviews",()=>assert.equal(classifyGmailMessage(m("Offer","We are pleased to offer you employment")),"offer"));
test("classifies rejections",()=>assert.equal(classifyGmailMessage(m("Update","Unfortunately we are not moving forward")),"rejection"));
test("unknown mail is ignored",()=>assert.equal(classifyGmailMessage(m("Newsletter","Hello there")),"unknown"));

test("OAuth state is signed and expires",()=>{process.env.GMAIL_OAUTH_STATE_SECRET="a".repeat(64);const state=createGmailState("acct-123");assert.equal(verifyGmailState(state),"acct-123");assert.equal(verifyGmailState(state+".tampered"),null);});
