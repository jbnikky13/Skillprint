import test from "node:test";
import assert from "node:assert/strict";
import { handleProductRequest } from "../dist/product/http.js";
import { DevAuthProvider } from "../dist/product/auth.js";
import { CareerCommandCenter } from "../dist/command-center/store.js";

test("product health endpoint is public",async()=>{const r=await handleProductRequest({method:"GET",path:"/health"},{auth:new DevAuthProvider(),center:()=>new CareerCommandCenter()});assert.equal(r.status,200);});
test("dashboard requires authentication",async()=>{const r=await handleProductRequest({method:"GET",path:"/api/dashboard"},{auth:new DevAuthProvider(),center:async()=>new CareerCommandCenter()});assert.equal(r.status,401);});
test("dashboard accepts a valid development session",async()=>{const auth=new DevAuthProvider();const identity=await auth.signIn("test@example.com");const r=await handleProductRequest({method:"GET",path:"/api/dashboard",headers:{authorization:"Bearer "+identity.accountId}},{auth,center:()=>new CareerCommandCenter()});assert.equal(r.status,200);const body=JSON.parse(r.body);assert.ok(body.analytics);});
