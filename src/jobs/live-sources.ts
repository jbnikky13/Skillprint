import type { JobSource } from "./types.js";
import { createRemotiveSource } from "./sources/remotive.js";
import { createJobicySource } from "./sources/jobicy.js";
import { createHimalayasSource } from "./sources/himalayas.js";
import { createRemoteJobsSource } from "./sources/remotejobs.js";
export function defaultLiveSources():JobSource[]{return [createRemotiveSource(),createJobicySource(),createHimalayasSource(),createRemoteJobsSource()];}
