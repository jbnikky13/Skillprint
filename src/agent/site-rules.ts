export interface SiteRule { host: string; allowed: boolean; requireApproval?: boolean; maxAttempts?: number; }
export function ruleFor(url:string,rules:SiteRule[]):SiteRule|undefined {
 try { const host=new URL(url).hostname.toLowerCase(); return rules.find(r=>host===r.host||host.endsWith("."+r.host)); } catch { return undefined; }
}
export const DEFAULT_SITE_RULES: SiteRule[] = [];
