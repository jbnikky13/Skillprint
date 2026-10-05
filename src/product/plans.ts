import type {Plan,PlanId} from "./types.js";
export const PLANS:Record<PlanId,Plan>={
 free:{id:"free",name:"Free",monthlyPriceUsd:0,monthlyApplicationLimit:5,apiAccess:false,recruiterMode:false},
 pro:{id:"pro",name:"Pro",monthlyPriceUsd:19,monthlyApplicationLimit:100,apiAccess:true,recruiterMode:false},
 team:{id:"team",name:"Team",monthlyPriceUsd:79,monthlyApplicationLimit:500,apiAccess:true,recruiterMode:true},
 enterprise:{id:"enterprise",name:"Enterprise",monthlyPriceUsd:0,monthlyApplicationLimit:10000,apiAccess:true,recruiterMode:true}
};
export function plan(id:PlanId):Plan{return PLANS[id];}
