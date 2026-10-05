import type { ApplicationPackage } from "./types.js";
export type ApprovalState="pending"|"approved"|"rejected";
export interface ApprovalItem{id:string;state:ApprovalState;package:ApplicationPackage;createdAt:string;reviewedAt?:string;}
export function createApprovalItem(pkg:ApplicationPackage):ApprovalItem{return{id:"approval-"+pkg.job.id+"-"+Date.now(),state:"pending",package:pkg,createdAt:new Date().toISOString()};}
export function approve(item:ApprovalItem):ApprovalItem{return{...item,state:"approved",reviewedAt:new Date().toISOString()};}
export function reject(item:ApprovalItem):ApprovalItem{return{...item,state:"rejected",reviewedAt:new Date().toISOString()};}
