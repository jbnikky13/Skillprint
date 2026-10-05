import { createFingerprint, matchFingerprints } from "./index.js";

const candidate=createFingerprint({
  kind:"candidate", title:"AI/Data Candidate",
  skills:["AI evaluation","data annotation","JavaScript"], tools:["Next.js"],
  domains:["AI","data"], roles:["AI evaluator"], locations:["Nigeria"],
  remoteEligible:true, remoteScope:"worldwide",
  evidence:[{source:"portfolio",description:"AI and data work",signals:["AI","data annotation"]}]
});

const job=createFingerprint({
  kind:"job", title:"Remote AI Evaluator",
  skills:["AI evaluation","data annotation"], tools:["JavaScript"],
  domains:["AI"], roles:["AI evaluator"], remoteEligible:true, remoteScope:"worldwide"
});

const result=matchFingerprints(candidate,job);
console.log(JSON.stringify({candidateId:candidate.id,jobId:job.id,score:result.score,eligible:result.eligible,matched:result.matched},null,2));
