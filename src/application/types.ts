import type { CVSelection } from "../cv/types.js";
import type { NormalizedJob } from "../jobs/types.js";
export interface TailoredCV { cvId:string; jobId:string; headline:string; selectedSkills:string[]; selectedEvidence:string[]; changes:string[]; }
export interface CoverLetter { jobId:string; cvId:string; content:string; claims:string[]; }
export interface ApplicationAnswer { question:string; answer:string; claims:string[]; confidence:number; }
export interface TruthReport { valid:boolean; unsupportedClaims:string[]; contradictions:string[]; warnings:string[]; }
export interface ApplicationPackage { job:NormalizedJob; cv:CVSelection; tailoredCV:TailoredCV; coverLetter:CoverLetter; answers:ApplicationAnswer[]; truthReport:TruthReport; }
