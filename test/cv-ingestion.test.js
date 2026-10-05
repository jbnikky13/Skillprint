import test from "node:test";
import assert from "node:assert/strict";
import { ingestCVText } from "../dist/cv/index.js";

test("ingests CV text into a structured profile", () => {
  const cv = ingestCVText(`PROFILE
Licensed pharmacist and AI/data professional.

EXPERIENCE
Worked on AI evaluation, data annotation and healthcare technology.

SKILLS
JavaScript, TypeScript, data annotation, LLM evaluation, automation.

PROJECTS
Built healthtech and blockchain products.

EDUCATION
Pharmacy
`, "sample-ai-pharmacy-cv.txt");

  assert.ok(cv.profile.skills.includes("data-annotation"));
  assert.ok(cv.profile.skills.includes("llm-evaluation"));
  assert.ok(cv.profile.domains.includes("healthcare"));
  assert.ok(cv.profile.domains.includes("blockchain"));
  assert.equal(cv.profile.tools.includes("github"), false);
});
