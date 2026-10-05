import type {CandidateCard,RecruiterPermission,RecruiterSearch} from "./types.js";
export interface RecruiterCandidateSource{search(input:RecruiterSearch):Promise<CandidateCard[]>;}
export const DEFAULT_RECRUITER_PERMISSION:RecruiterPermission={canViewProfile:true,canViewEvidence:false,canContact:false};
export async function searchCandidates(source:RecruiterCandidateSource,input:RecruiterSearch,permission=DEFAULT_RECRUITER_PERMISSION):Promise<CandidateCard[]>{
 if(!permission.canViewProfile)throw new Error("Candidate discovery is not permitted.");
 return source.search({...input,limit:Math.min(input.limit??20,100)});
}
