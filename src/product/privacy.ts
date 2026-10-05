import type {PrivacySettings,UserRole} from "./types.js";
export const DEFAULT_PRIVACY:PrivacySettings={profileVisibility:"private",allowRecruiterDiscovery:false,allowModelImprovement:false,shareContactAfterMatch:false,dataRetentionDays:365};
export function canDiscover(settings:PrivacySettings):boolean{return settings.allowRecruiterDiscovery&&settings.profileVisibility!=="private";}
export function visibleCandidateFields(settings:PrivacySettings,requesterRole:UserRole):string[]{
 if(requesterRole==="candidate"||requesterRole==="admin")return["headline","skills","roles","domains","evidence","contact"];
 if(!canDiscover(settings))return[];
 return settings.shareContactAfterMatch?["headline","skills","roles","domains","evidence","contact"]:["headline","skills","roles","domains"];
}
