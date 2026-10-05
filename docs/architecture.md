# Skillprint Architecture

## Design principle

Separate fast deterministic retrieval from expensive AI reasoning.

AI is useful, but every job should not require a large model call.

## Pipeline

    Candidate Evidence
    CV / Portfolio / GitHub
             |
             v
    Normalization Layer
             |
             v
    Candidate Fingerprint
             |
             |                 Job Sources
             |                     |
             |                     v
             |              Job Normalization
             |                     |
             |                     v
             |                Job Fingerprint
             |                     |
             +----------+----------+
                        |
                        v
                Hard Eligibility
                        |
                        v
              Fingerprint Similarity
                        |
                   Top candidates
                        |
                        v
               Semantic / LLM Layer
                        |
                        v
             Match + Evidence + Gaps

## Fingerprint dimensions

The initial fingerprint contains:

- skills
- tools
- domains
- roles
- seniority
- experience
- education
- certifications
- project evidence
- location
- remote eligibility
- work authorization
- compensation
- languages
- career preferences

## Matching philosophy

A match is not simply shared keywords divided by total keywords.

Instead, the engine combines:

- eligibility
- weighted skill similarity
- evidence strength
- domain similarity
- role similarity
- preference fit

Hard constraints such as location eligibility can eliminate an opportunity before scoring.

## Evidence

Skillprint distinguishes between:

- claimed skill — appears in CV/profile
- demonstrated skill — supported by a project or work sample
- verified skill — independently verified
- inferred skill — strongly implied but not directly claimed

This prevents the engine from treating every keyword as equally credible.

## AI usage

LLMs should initially be used for:

- extracting structured information from messy documents
- resolving ambiguous skill names
- semantic job interpretation
- application tailoring
- final match explanation

They should not be required for every basic similarity calculation.

## Data privacy

Candidate documents are sensitive. The architecture should support:

- encrypted storage
- least-privilege access
- explicit document deletion
- isolated candidate data
- no training on user documents by default
- audit logs for automated applications
