# Skillprint Roadmap

## Product North Star

Build a global career agent that continuously discovers opportunities, creates a fingerprint for every opportunity, compares them against a candidate's professional fingerprint, selects the strongest evidence/CV, prepares an accurate application, and optionally submits it.

## Phase 0 — Foundation

Status: STARTED

- [x] Create repository
- [x] Define Career Fingerprint concept
- [x] Define global-first product direction
- [x] Establish roadmap
- [ ] Define canonical data model
- [ ] Define matching benchmark dataset

## Phase 1 — Career Fingerprint Engine

Status: CURRENT

### Candidate fingerprint

- [ ] CV text normalization
- [ ] Skill extraction schema
- [ ] Experience extraction
- [ ] Industry/domain extraction
- [ ] Project/evidence extraction
- [ ] Portfolio/GitHub evidence model
- [ ] Location and remote eligibility
- [ ] Salary preferences
- [ ] Work authorization constraints
- [ ] Career intent/preferences
- [ ] Deterministic fingerprint generation

### Job fingerprint

- [ ] Job description normalization
- [ ] Required vs preferred skills
- [ ] Seniority
- [ ] Industry/domain
- [ ] Remote/location eligibility
- [ ] Compensation
- [ ] Experience requirements
- [ ] Education/certification requirements
- [ ] Application constraints
- [ ] Deterministic fingerprint generation

### Matching

- [ ] Weighted similarity engine
- [ ] Hard eligibility filters
- [ ] Semantic similarity layer
- [ ] Evidence strength scoring
- [ ] Match explanation
- [ ] Skill-gap detection
- [ ] Match confidence
- [ ] Benchmark tests

Phase 1 exit condition: given a candidate profile and a job, Skillprint produces a reproducible match score plus an explanation of why the match exists.

## Phase 2 — Candidate Intelligence

Status: PLANNED

- [ ] CV library
- [ ] Multiple career profiles
- [ ] Portfolio ingestion
- [ ] GitHub project analysis
- [ ] Career skill graph
- [ ] Evidence weighting
- [ ] Skill aliases and ontology
- [ ] Candidate fingerprint versioning
- [ ] Discover jobs the candidate did not know they qualified for

## Phase 3 — Global Job Discovery

Status: PLANNED

- [ ] Job source adapters
- [ ] Company career pages
- [ ] Remote-first sources
- [ ] Nigeria-specific sources
- [ ] International sources
- [ ] Job deduplication
- [ ] Expired-job detection
- [ ] Location eligibility detection
- [ ] Worldwide vs country-restricted remote detection
- [ ] Scheduled discovery

Phase 3 exit condition: Skillprint can continuously ingest and normalize opportunities from multiple legitimate sources.

## Phase 4 — Intelligent Ranking

Status: PLANNED

- [ ] Fast fingerprint retrieval
- [ ] Vector/semantic retrieval
- [ ] LLM deep evaluation
- [ ] Multi-stage ranking
- [ ] Match explanations
- [ ] Opportunity quality score
- [ ] Fraud/scam signals
- [ ] Salary quality score
- [ ] Application effort score

Target pipeline:

    Thousands of jobs
          |
    Eligibility filter
          |
    Fingerprint retrieval
          |
        Top 100
          |
    Semantic reranking
          |
         Top 20
          |
    Deep AI evaluation
          |
    Best opportunities

## Phase 5 — CV & Application Intelligence

Status: PLANNED

- [ ] CV library
- [ ] Automatic CV selection
- [ ] Job-specific CV tailoring
- [ ] ATS-aware formatting
- [ ] Cover letters
- [ ] Application question generation
- [ ] Truth/consistency checker
- [ ] Human approval queue

## Phase 6 — Application Agent

Status: PLANNED

Three modes:

### Manual
Skillprint prepares everything; user submits.

### Approval
Skillprint prepares applications and waits for approval.

### Autonomous
Skillprint submits applications that satisfy user-defined rules.

Safety requirements:

- Never invent experience
- Never invent qualifications
- Never alter factual employment history
- Never bypass application security controls
- Respect site terms and rate limits
- Require approval for sensitive or high-risk applications

## Phase 7 — Career Command Center

Status: PLANNED

- [ ] Dashboard
- [ ] Saved opportunities
- [ ] Application queue
- [ ] Application history
- [ ] Interview tracking
- [ ] Offer tracking
- [ ] Email/application status ingestion
- [ ] Analytics
- [ ] Daily career brief
- [ ] Notifications

## Phase 8 — Personal Agent -> Global Product

Status: PLANNED

First prove Skillprint on a real candidate workflow.

Then generalize:

- [ ] Multi-user accounts
- [ ] Candidate onboarding
- [ ] Privacy controls
- [ ] Billing
- [ ] Usage limits
- [ ] Team/recruiter mode
- [ ] Public API
- [ ] Skillprint fingerprint API

## Current build target

Phase 1.1 — Deterministic Fingerprint Engine

The immediate goal is not scraping or auto-applying.

The immediate goal is proving:

Can a structured career fingerprint find a genuinely better match than simple keyword overlap?

Once that works, everything else can be built around it.
