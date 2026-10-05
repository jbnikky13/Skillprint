import type { CommandCenterAnalytics, CommandCenterSnapshot } from "./types.js";
export function calculateAnalytics(data:CommandCenterSnapshot):CommandCenterAnalytics{
 const active=data.opportunities.filter(x=>x.job.status==="active").length;
 const saved=data.opportunities.filter(x=>x.stage==="saved").length;
 const applications=data.applications.length;
 const interviews=data.interviews.length;
 const offers=data.offers.length;
 const submitted=data.applications.filter(x=>x.state==="submitted").length;
 const avg=data.opportunities.filter(x=>x.ranked).reduce((s,x)=>s+(x.ranked?.finalScore??0),0)/(data.opportunities.filter(x=>x.ranked).length||1);
 return {activeOpportunities:active,saved,applications,interviews,offers,responseRate:applications?submitted/applications*100:0,interviewRate:applications?interviews/applications*100:0,offerRate:applications?offers/applications*100:0,averageMatchScore:Math.round(avg*10)/10,pendingApplications:data.applications.filter(x=>["queued","awaiting_approval","ready"].includes(x.state)).length};
}
