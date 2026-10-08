import test from "node:test";import assert from "node:assert/strict";import {classifyGmailMessage} from "../dist/product/gmail.js";
const m=(subject,body="")=>({id:"1",headers:{subject},snippet:"",bodyText:body});
test("classifies application confirmations",()=>assert.equal(classifyGmailMessage(m("Application received","Thank you for applying")),"application_received"));
test("classifies interviews",()=>assert.equal(classifyGmailMessage(m("Interview invitation","We would like to interview you")),"interview"));
test("classifies offers before interviews",()=>assert.equal(classifyGmailMessage(m("Offer","We are pleased to offer you employment")),"offer"));
test("classifies rejections",()=>assert.equal(classifyGmailMessage(m("Update","Unfortunately we are not moving forward")),"rejection"));
test("unknown mail is ignored",()=>assert.equal(classifyGmailMessage(m("Newsletter","Hello there")),"unknown"));
