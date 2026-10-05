import type {PlanId,Subscription} from "./types.js"; import {plan} from "./plans.js";
export function canUseApi(subscription:Subscription):boolean{return subscription.status==="active"&&plan(subscription.planId).apiAccess;}
export function canRecruit(subscription:Subscription):boolean{return subscription.status==="active"&&plan(subscription.planId).recruiterMode;}
export function applicationLimit(subscription:Subscription):number{return plan(subscription.planId).monthlyApplicationLimit;}
