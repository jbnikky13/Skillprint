import type { JobSource } from "../types.js";
export function createSourceCatalog(sources:JobSource[]){return {all:()=>[...sources],byScope:(scope:JobSource["scope"])=>sources.filter(s=>s.scope===scope)};}
