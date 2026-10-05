# Canonical Career Fingerprint v1

Skillprint's stable fingerprint contract is CareerFingerprint in src/fingerprint/types.ts.

## Versioning

- version is currently the integer 1.
- New backward-compatible optional fields may be added within v1.
- A breaking change to field meaning, required structure, normalization, or matching semantics requires a new version.
- kind is either candidate or job.
- Fingerprints are normalized before matching; normalization is deterministic.
- id is a deterministic SHA-256-derived identifier of the normalized fingerprint.

## Evidence

Signals use four evidence levels:

- verified — independently verified or strongly authoritative evidence.
- demonstrated — supported by work, projects, portfolio, GitHub, or comparable evidence.
- claimed — supplied by the candidate/job source without independent verification.
- inferred — derived by the system and therefore lower confidence.

Job signals may additionally use requirement: required or preferred.

## Hard constraints

Work authorization and geographic/remote eligibility can make a match ineligible. These constraints are evaluated separately from the weighted similarity score.

## Matching dimensions

The matcher evaluates skills, tools, domains, roles, seniority, experience, salary and authorization.

Semantic matching may add terminology/embedding similarity, but it must not bypass hard eligibility constraints.
