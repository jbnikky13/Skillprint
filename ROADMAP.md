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
**Status: IN PROGRESS**

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
- [ ] Semantic/embedding similarity
- [ ] Larger benchmark suite

**Current milestone: 1.7 — Compatibility Scoring**

### Phase 2 — Candidate Intelligence
**Status: NEXT**

- [ ] CV file ingestion
- [ ] PDF/DOCX text extraction
- [ ] CV fingerprint generation
- [ ] Portfolio ingestion
- [ ] GitHub repository analysis
- [ ] Evidence graph
- [ ] Career skill graph
- [ ] Candidate fingerprint versioning

### Phase 3 — Global Job Discovery
**Status: PLANNED**

- [ ] Job source adapter architecture
- [ ] Company career pages
- [ ] International remote sources
- [ ] Nigeria sources
- [ ] Port Harcourt/local opportunities
- [ ] Job normalization
- [ ] Deduplication
- [ ] Expired-job detection
- [ ] Remote eligibility detection
- [ ] Scheduled discovery

### Phase 4 — Intelligent Ranking
**Status: PLANNED**

- [ ] Fast fingerprint retrieval
- [ ] Vector/semantic retrieval
- [ ] LLM deep evaluation
- [ ] Multi-stage ranking
- [ ] Opportunity quality score
- [ ] Scam/fraud signals
- [ ] Salary quality score
- [ ] Application effort score

### Phase 5 — CV & Application Intelligence
**Status: PLANNED**

- [ ] Job-specific CV selection
- [ ] CV tailoring
- [ ] ATS-aware formatting
- [ ] Cover letters
- [ ] Application question answers
- [ ] Truth/consistency checker
- [ ] Approval queue

### Phase 6 — Application Agent
**Status: PLANNED**

- [ ] Manual mode
- [ ] Approval mode
- [ ] Autonomous mode
- [ ] Browser/application workflow
- [ ] Rate limits and site rules
- [ ] Application audit trail
- [ ] Never fabricate qualifications

### Phase 7 — Career Command Center
**Status: PLANNED**

- [ ] Dashboard
- [ ] Opportunity feed
- [ ] Saved jobs
- [ ] Application queue
- [ ] Interview tracking
- [ ] Offer tracking
- [ ] Email/status ingestion
- [ ] Analytics
- [ ] Notifications

### Phase 8 — Global Product
**Status: PLANNED**

- [ ] Multi-user accounts
- [ ] Privacy controls
- [ ] Billing
- [ ] Public API
- [ ] Skillprint fingerprint API
- [ ] Recruiter/company mode

## Immediate build sequence

1. Finish fingerprint compatibility scoring. **DONE**
2. Ingest real CV files.
3. Generate fingerprints from those CVs.
4. Ingest portfolio/GitHub evidence.
5. Test against a benchmark set of real job descriptions.
6. Build the first global job discovery adapters.
7. Add ranking and CV selection.
8. Add application preparation.
9. Add approval-controlled application automation.
