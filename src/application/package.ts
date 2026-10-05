import type { CareerFingerprint } from "../fingerprint/types.js";
import type { CVProfile } from "../cv/types.js";
import type { RankedOpportunity } from "../ranking/types.js";
import type { ApplicationPackage } from "./types.js";
import {selectBestCV} from "../cv/select.js"; import {tailorCV} from "./tailor.js"; import {generateCoverLetter} from "./cover-letter.js"; import {answerApplicationQuestion} from "./answers.js"; import {validateTruth} from "./truth.js";
export function prepareApplication(candidate:CareerFingerprint,cvs:CVProfile[],opportunity:RankedOpportunity,questions:string[]=[]):ApplicationPackage{
 const selection=selectBestCV(opportunity.job.fingerprint,cvs)[0]; if(!selection)throw new Error("No CV profiles available.");
 const profile=cvs.find(x=>x.id===selection.cvId); if(!profile)throw new Error("Selected CV is unavailable.");
 const tailoredCV=tailorCV(profile,opportunity.job,candidate); const coverLetter=generateCoverLetter(profile,opportunity.job);
 const answers=questions.map(q=>answerApplicationQuestion(q,profile,candidate));
 const candidateClaims=new Set([...profile.skills,...profile.tools,...profile.targetRoles,...profile.priorityDomains,...(candidate.evidence??[]).flatMap(e=>e.signals)]);
 const truthReport=validateTruth(candidateClaims,tailoredCV,coverLetter,answers);
 return {job:opportunity.job,cv:selection,tailoredCV,coverLetter,answers,truthReport};
}
