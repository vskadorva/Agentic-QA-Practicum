# Eval report

**Generated:** 2026-11-18  
**Window:** last N=30 `playwright.yml` runs (2026-10-14T00:08:49Z–2026-11-18T16:07:26Z; 19 success, 11 failure); PRs #1–#11 (2026-10-10–2026-10-17) plus the AQPBT-19 generation PR opened this session  
**Trigger:** generation PR (Backlog mode, AQPBT-19)

## Summary

| Metric | Value | How measured | Interpretation |
| ------ | ----- | ------------ | -------------- |
| Flake rate | **insufficient data** | `gh run view <id> --log` on all 19 passing runs; the custom `support/cleanup-reporter.ts` suppresses Playwright's passed/flaky summary, and no HTML artifacts were pulled | Cannot count retry-passes from logs as configured |
| Heal success rate | **0/1** (masked regressions: **0**) | `heal/*` PRs: #8 (`heal/login-button`); first CI run 38491977778 = failure; `gh pr diff 8` touches `pages/` and `tests/` (no `expect(` lines changed) | The only heal PR missed both gates (first-CI green, POM-only); single sample |
| Generation-gate pass rate | **3/5** on CI-green criterion | `gh pr checks` on Jira-keyed spec PRs #2, #3, #4 (pass) and #6, #7 (AQPBT-5, regression + smoke fail); full convention/AC audit not repeated per PR | Earlier ticket PRs gated cleanly; AQPBT-5 merged with red PR checks |
| Ask vs guess | **no guesses observed (n=1 session)** | Reviewed this session (AQPBT-19): every label, route and heading taken from the Jira AC and confirmed against the live aria tree; no asks were needed | Grounded, but sample too small for a tier |

## Details

### Flake rate

All 30 runs were attempt 1 at the job level. Playwright `retries: 2` in CI means flakes would only appear in reporter output, but the run logs carry no `N passed` / `N flaky` lines because `support/cleanup-reporter.ts` replaces the default reporter (confirmed locally: the same command prints no summary without `--reporter=list`). **insufficient data** — no numerator/denominator stated. Cleanup **404** lines remain excluded as noise.

### Heal success rate

| PR | Branch | First CI | Files | `expect(` changed |
| --- | --- | --- | --- | --- |
| #8 | `heal/login-button` | failure (38491977778); later runs green | `pages/login.page.ts`, `tests/aqpbt-1-log-in.spec.ts`, `tests/aqpbt-5-dashboard-manage-kids.spec.ts` | none |

0/1 pass. No masked regressions (no `expect` removed, weakened, or commented out).

### Generation-gate pass rate

| PR | Ticket | PR checks | Result |
| --- | --- | --- | --- |
| #2 | AQPBT-8 | regression pass | pass |
| #3 | AQPBT-6 | regression pass | pass |
| #4 | AQPBT-4 | regression pass | pass |
| #6 | AQPBT-5 | regression fail, smoke fail | fail |
| #7 | AQPBT-5 | regression fail, smoke fail | fail |

The AQPBT-19 PR from this session is not counted (CI pending at report time); its spec passed 7/7 locally against the live app.

### Ask vs guess

One session reviewed (this one). The ticket explicitly listed labels and paths; they were checked against the live landing page, `/privacy`, and `/terms` before the plan was written. Confluence was searched and confirmed to have no page for the story. No invented values. Needs ≥3 sessions before assigning a tier.

## Top reliability risk

Flake rate is unmeasurable because the cleanup reporter hides the Playwright summary in CI logs, so retry-masked flakes would go unnoticed.

## Next action

Add the `list` (or `json`) reporter alongside `support/cleanup-reporter.ts` in CI, or upload the HTML report as an artifact, then re-run this skill to compute flake rate.
