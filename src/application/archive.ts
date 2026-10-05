import type { ApplicationPackage } from "./types.js";
import type { ApplicationSubmission } from "../agent/types.js";

export interface SentApplicationCopy {
  id:string;
  jobId:string;
  jobTitle:string;
  company?:string;
  applicationUrl:string;
  submittedAt:string;
  externalId?:string;
  status:"submitted"|"failed";
  cvId:string;
  cvSnapshot:ApplicationPackage["tailoredCV"];
  coverLetter:string;
  answers:ApplicationPackage["answers"];
  truthReport:ApplicationPackage["truthReport"];
  submissionMessage?:string;
}

export class ApplicationArchive {
  private records:SentApplicationCopy[]=[];
  save(pkg:ApplicationPackage,submission:ApplicationSubmission):SentApplicationCopy{
    const record:SentApplicationCopy={
      id:"sent-"+pkg.job.id+"-"+Date.now(),
      jobId:pkg.job.id,
      jobTitle:pkg.job.title,
      company:pkg.job.company,
      applicationUrl:pkg.job.url,
      submittedAt:new Date().toISOString(),
      externalId:submission.externalId,
      status:submission.accepted?"submitted":"failed",
      cvId:pkg.cv.cvId,
      cvSnapshot:structuredClone(pkg.tailoredCV),
      coverLetter:pkg.coverLetter.content,
      answers:structuredClone(pkg.answers),
      truthReport:structuredClone(pkg.truthReport),
      submissionMessage:submission.message
    };
    this.records.push(record);
    return structuredClone(record);
  }
  list():SentApplicationCopy[]{return structuredClone(this.records);}
  get(id:string):SentApplicationCopy|undefined{const r=this.records.find(x=>x.id===id);return r?structuredClone(r):undefined;}
}
