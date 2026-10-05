import test from "node:test";
import assert from "node:assert/strict";
import { createPdfAdapter } from "../dist/cv/adapters/pdf.js";
import { createDocxAdapter } from "../dist/cv/adapters/docx.js";

test("PDF adapter accepts .pdf", () => assert.equal(createPdfAdapter(async () => "x").supports(".pdf"), true));
test("DOCX adapter accepts .docx", () => assert.equal(createDocxAdapter(async () => "x").supports(".docx"), true));
