import type {ApplicationBrowser} from "./types.js";
export interface BrowserPageSnapshot{url:string;title:string;text:string;fields:Array<{label:string;selector:string;required?:boolean;type?:string}>}
export interface BrowserDriver extends ApplicationBrowser{snapshot():Promise<BrowserPageSnapshot>;close():Promise<void>}
export interface BrowserFactory{open():Promise<BrowserDriver>}
export function createUnavailableBrowserFactory():BrowserFactory{ return {async open(){throw new Error("No browser driver configured. Production execution requires an approved browser runtime.");}};}
