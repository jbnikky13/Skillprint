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
**Status: IN PROGRESS**

- [x] Multi-user account model
- [x] Privacy controls
- [x] Plan/subscription and capability gating
- [x] Public API/key foundation
- [x] Skillprint API contract foundation
- [x] Recruiter/company search and permission foundation

## Immediate build sequence

1. Finish fingerprint compatibility scoring. **DONE**
2. Ingest real CV files. **DONE**
3. Generate fingerprints from those CVs. **DONE**
4. Ingest portfolio/GitHub evidence.
5. Test against a benchmark set of real job descriptions.
6. Build the first global job discovery adapters.
7. Add ranking and CV selection.
8. Add application preparation.
9. Add approval-controlled application automation.
