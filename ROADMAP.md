# Skillprint Roadmap

## Product North Star

Build a global career agent that continuously discovers opportunities, fingerprints them, compares them against a candidate's professional fingerprint, selects the strongest evidence/CV, prepares an accurate application, and optionally submits it.

## Progress

### Phase 0 — Foundation
**Status: COMPLETE**

- [x] Repository created
- [x] Career Fingerprint concept
- [x] Global-first direction
- [x] Architecture and roadmap
- [x] Initial data model
- [x] Initial matching engine
- [x] Personal candidate fixture

### Phase 1 — Fingerprint Engine
**Status: COMPLETE**

- [x] Canonical fingerprint types
- [x] Signal normalization
- [x] Candidate fingerprint generation
- [x] Job fingerprint generation
- [x] Weighted similarity
- [x] Evidence-aware scoring
- [x] Remote/location eligibility
- [x] Match explanations
- [x] Personal candidate benchmark
- [x] Multi-CV profile model
- [x] Automatic CV ranking
- [x] Required vs preferred job requirements
- [x] Seniority compatibility
- [x] Years-of-experience compatibility
- [x] Salary compatibility
- [x] Work-authorization compatibility
- [x] Semantic/embedding similarity (provider-backed HTTP embedding interface + cosine similarity)
- [x] Larger benchmark suite (initial benchmark set + CI)

**Current milestone: 3.0 — Phase 3 Complete**

### Phase 2 — Candidate Intelligence
**Status: COMPLETE**

- [x] CV file ingestion
- [x] PDF/DOCX text extraction
- [x] CV fingerprint generation
- [x] Portfolio ingestion
- [x] GitHub repository analysis
- [x] Evidence graph
- [x] Career skill graph
- [x] Candidate fingerprint versioning

### Phase 3 — Global Job Discovery
**Status: COMPLETE**

- [x] Job source adapter architecture
- [x] Company career pages
- [x] International remote sources
- [x] Nigeria sources
- [x] Port Harcourt/local opportunities
- [x] Job normalization
- [x] Deduplication
- [x] Expired-job detection
- [x] Remote eligibility detection
- [x] Scheduled discovery

### Phase 4 — Intelligent Ranking
**Status: COMPLETE**

- [x] Fast fingerprint retrieval
- [x] Vector/semantic retrieval
- [x] Deep evaluation interface + deterministic fallback
- [x] Multi-stage ranking
- [x] Opportunity quality score
- [x] Scam/fraud signals
- [x] Salary quality score
- [x] Application effort score

### Phase 5 — CV & Application Intelligence
**Status: COMPLETE**

- [x] Job-specific CV selection
- [x] CV tailoring
- [x] ATS-aware content selection foundation
- [x] Cover letters
- [x] Application question answer guardrails
- [x] Truth/consistency checker
- [x] Approval queue

### Phase 6 — Application Agent
**Status: COMPLETE**

- [x] Manual mode
- [x] Approval mode
- [x] Autonomous mode (policy-gated)
- [x] Browser/application workflow interface + workflow registry
- [x] Rate limits and site rules
- [x] Application audit trail
- [x] Never fabricate qualifications / truth-gated execution

### Phase 7 — Career Command Center
**Status: COMPLETE**

- [x] Dashboard data/command-center layer
- [x] Opportunity feed/state management
- [x] Saved jobs
- [x] Application queue
- [x] Interview tracking
- [x] Offer tracking
- [x] Email/status ingestion/classification
- [x] Funnel analytics
- [x] Notifications

### Phase 8 — Global Product
**Status: COMPLETE (code layer)**

- [x] Multi-user account model
- [x] Privacy controls
- [x] Plan/subscription and capability gating
- [x] Public API/key foundation
- [x] Skillprint API contract foundation
- [x] Recruiter/company search and permission foundation

## v1.0 Productization
**Status: CODE-COMPLETE — DEPLOYMENT CONFIGURATION REMAINS**

- [x] Career Command Center UI foundation
- [x] Opportunity feed UI
- [x] Application queue UI
- [x] Sent application archive UI
- [x] Exact submitted CV/cover-letter/answers record model
- [x] Persistence repository boundary (provider-neutral; production adapter next)
- [x] Authentication provider boundary (provider-neutral; production provider next)
- [x] Connect live job-source ingestion pipeline to dashboard service
- [x] Connect production email/status ingestion boundary
- [x] Connect verified site-specific workflow framework (site configs required per target)

## Remaining build work

All numbered product phases (0–8) are complete at the code layer. The remaining work is **productionization and deployment**, not another numbered phase.

1. **Production persistence** — connect the provider-neutral repository boundary to the production database.
2. **Production authentication** — replace the development auth provider with the selected production identity provider.
3. **Live mailbox integration** — connect the email/status-ingestion boundary to the user's real mailbox with OAuth.
4. **Verified site workflows** — add and test site-specific browser selectors/workflows for each target ATS. Unknown/unverified sites must remain blocked.
5. **Production dashboard/API deployment** — expose the command center and API through the chosen production application/runtime.
6. **Operational hardening** — monitoring, retries, rate-limit handling, secret management, audit-log retention, and deployment smoke tests.
7. **End-to-end personal job hunter** — run discovery → ranking → CV selection → application preparation → approval/submission against real deployment credentials.

These items deliberately remain outside the repository's deterministic core until deployment-specific credentials, providers, and verified site workflows are supplied.


## Deployment-only requirements

These are intentionally not hard-coded into the repository: production database/auth credentials, mailbox OAuth connection, and site-specific browser credentials/workflow selectors must be supplied by the deployment owner. The code now exposes provider boundaries for each without storing secrets or pretending unverified sites are safe to automate.
