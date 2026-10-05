import test from "node:test";import assert from "node:assert/strict";import {CareerCommandCenter,dashboardView} from "../dist/index.js";
test("dashboard view combines snapshot and analytics",()=>{const c=new CareerCommandCenter();const v=dashboardView(c);assert.equal(v.analytics.applications,0);assert.deepEqual(v.snapshot.applications,[]);});
