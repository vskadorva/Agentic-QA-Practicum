# Eval report

**Generated:** 2026-10-13  
**Window:** N=30 requested; **21** `playwright.yml` runs exist (2026-10-10T00:39:46Z–2026-10-13T23:59:35Z); PRs #1–#5 through 2026-10-13  
**Trigger:** manual (README + eval refresh)

## Summary


| Metric                    | Value                 | How measured                                                                                                                           | Interpretation                                                                           |
| ------------------------- | --------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Flake rate                | **insufficient data** | Skill default: flaky count from HTML reports in the last N green runs; only 21 total runs and no systematic artifact pull this refresh | Window and sample size too small to compute a stable rate; do not infer from spot checks |
| Heal success rate         | **insufficient data** | `gh pr list --state all` — no `heal/`* branches; PR #5 is drift simulation, not a self-heal PR                                         | Denominator 0; metric undefined until heal PRs exist                                     |
| Generation-gate pass rate | **insufficient data** | Ticket-first PRs #2, #3, #4 add specs; all merged with green CI on their PR runs, but N=3 and no full AC audit in this refresh         | Too few generation PRs for a gate pass rate                                              |
| Ask vs guess              | **insufficient data** | Qualitative metric needs deliberate review of multiple agent sessions/transcripts                                                      | Not sampled systematically this refresh                                                  |




## Details



### Flake rate

Twenty-one workflow runs are on record (`gh run list --workflow=playwright.yml --limit 30`). Four concluded `failure` (early workflow bring-up and recent drift/login-button runs); seventeen `success`. Playwright is configured with `retries: 2` in CI, so a proper flake rate requires parsing reporter/HTML output across passing runs. That scrape was not performed for this refresh, and the run count is below the skill’s N=30 window. **insufficient data** — no numerator/denominator stated.

Excluded from any future flake math: global teardown cleanup **404** noise (see eval-report skill).

### Heal success rate

Branches observed: `tests/*`, `drift/*`, `ci/*` — none match `heal/*`. No PR diff reviewed under the self-heal rule (POM-only, assertions unchanged). Masked-regression count not applicable. **insufficient data**.

### Generation-gate pass rate

Candidate PRs (Jira key + `tests/` changes):


| PR  | Ticket  | CI on PR (sample run) | Notes  |
| --- | ------- | --------------------- | ------ |
| #2  | AQPBT-8 | success (38011999469) | Merged |
| #3  | AQPBT-6 | success (38013667848) | Merged |
| #4  | AQPBT-4 | success (38266029056) | Merged |


PR #1 is CI wiring only; PR #5 is drift simulation, not generation. A formal gate pass rate (conventions + AC mapping spot-check per skill) was not executed on this small set. **insufficient data** for a percentage.

### Ask vs guess

Prior session notes in the 2026-10-12 report referenced grounded ticket/Confluence use for AQPBT-4/8, but this refresh did not re-review transcripts to a defined sample size. **insufficient data**.

## Top reliability risk

Recent **drift/login-button** activity produced failing Playwright runs on push/PR (runs 38487415010, 38487418512, 38487540655). Until triage classifies drift vs product regression and smoke/sanity slices cover the affected flow, CI signal on default triggers may not catch full-suite regressions.

## Next action

When heal or generation work closes a session, re-run this skill with artifact download on the last N **passing** runs to populate flake rate, and extend the ask-vs-guess sample to at least three reviewed sessions before assigning a tier.