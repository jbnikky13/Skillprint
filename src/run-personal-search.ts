import { defaultLiveSources } from "./jobs/live-sources.js";
import { discoverJobsWithFailures } from "./jobs/discovery.js";
import { rankOpportunities } from "./ranking/rank.js";
import { matchPersonalJobs, defaultPersonalPreferences } from "./profile/job-search.js";
import { personalCandidate } from "./profile/personal.js";

const query = {
  keywords: defaultPersonalPreferences.preferredRoles,
  locations: defaultPersonalPreferences.locations,
  remoteOnly: defaultPersonalPreferences.remoteOnly,
  limit: 30
};

const discovered = await discoverJobsWithFailures(defaultLiveSources(), query);
const ranked = await rankOpportunities(personalCandidate, discovered.jobs, { maxCandidates: 100 });
const personal = matchPersonalJobs(ranked.map((item) => item.job), defaultPersonalPreferences);
const byId = new Map(ranked.map((item) => [item.job.id, item]));

const results = personal.filter((item) => item.eligible).slice(0, 25).map((item, index) => {
  const rankedItem = byId.get(item.job.id);
  return {
    rank: index + 1,
    matchScore: rankedItem?.finalScore ?? item.score,
    cv: item.recommendedCvId,
    title: item.job.title,
    company: item.job.company ?? "Unknown",
    location: item.job.location ?? "Remote",
    remote: Boolean(item.job.remote),
    source: item.job.source,
    url: item.job.url,
    reasons: item.reasons
  };
});

console.log(JSON.stringify({
  generatedAt: new Date().toISOString(),
  query,
  summary: {
    discovered: discovered.jobs.length,
    ranked: ranked.length,
    eligibleMatches: personal.filter((item) => item.eligible).length,
    sourceFailures: discovered.failures.length
  },
  sourceFailures: discovered.failures,
  results
}, null, 2));
