import type {CareerCommandCenter} from "../command-center/store.js";
import type {CommandCenterAnalytics,CommandCenterSnapshot} from "../command-center/types.js";
import {calculateAnalytics} from "../command-center/analytics.js";
export interface DashboardView{snapshot:CommandCenterSnapshot;analytics:CommandCenterAnalytics;}
export function dashboardView(center:CareerCommandCenter):DashboardView{return{snapshot:center.snapshot(),analytics:calculateAnalytics(center.snapshot())};}
