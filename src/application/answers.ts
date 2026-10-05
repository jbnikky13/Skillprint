import type { CVProfile } from "../cv/types.js";
import type { ApplicationAnswer } from "./types.js";
export function answerApplicationQuestion(question:string,profile:CVProfile,candidate:{evidence?:{source:string;description:string;signals:string[]}[]}):ApplicationAnswer {
 const q=question.toLowerCase(); const matched=profile.skills.filter(s=>q.includes(s.toLowerCase()));
 if(/years? of experience|authorized|sponsor|salary|relocat/.test(q)) return {question,answer:"Requires candidate confirmation before submission.",claims:[],confidence:0};
 const evidence=(candidate.evidence??[]).filter(e=>e.signals.some(s=>matched.includes(s)));
 if(matched.length) return {question,answer:"I have documented experience with "+matched.join(", ")+".",claims:matched,confidence:evidence.length?.85:.55};
 return {question,answer:"Requires candidate review before submission.",claims:[],confidence:0};
}
