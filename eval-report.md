# Eval report

**Generated:** 2026-10-10  
**Window:** last N=8 `playwright.yml` runs (2026-10-10); PRs through 2026-10-10  
**Trigger:** generation PR (#2, AQPBT-8)

## Summary

| Metric | Value | How measured | Interpretation |
| ------ | ----- | ------------ | -------------- |
| Flake rate | insufficient data | No retry-only passes identified in sampled green run logs for N=8 | Window too small and logs not fully parsed for per-test retry counts |
| Heal success rate | 0/0 | `gh pr list` — no `heal/*` PRs | No heal activity in window |
| Generation-gate pass rate | 1/1 (pending full suite history) | PR #2 references AQPBT-8, adds `tests/aqpbt-8-*`, CI regression job green | First ticket-first generation PR passes local + CI regression slice |
| Ask vs guess | mostly asks (1 session) | AQPBT-8 orchestration: Confluence searched when no page linked; N1 omitted with documented unknown baseline | No invented routes or credentials |

## Details

### Flake rate

Green runs: 38011922340, 38011913863, 38011294937, 38011104246, 38011031408, 38010583827, 38010075527. Failures on main pushes (38010208811, 38010004091) were workflow/config, not retried test flakes. Per-test first-attempt vs retry not extracted from artifacts in this refresh.

### Heal success rate

No heal PRs in repository history during window.

### Generation-gate pass rate

- **PR #2:** Jira AQPBT-8 in title/body; plan `features/AQPBT-8.feature.md`; spec tags `@regression` / `@sanity` one per test; POM extended under `pages/`. CI `regression` check passed on push and pull_request (2026-10-10).

### Ask vs guess

Orchestrator session for AQPBT-8: Jira AC + explore feature file; Confluence CQL found no dedicated availability page; Feature map returned summary only. Test-writer skipped N1 rather than guessing Family A baseline slots.

## Top reliability risk

`@regression` availability tests mutate shared Family A weekly state without API teardown — parallel runs or repeat executions may interact.

## Next action

Add availability API tracking + cleanup per `api-cleanup` skill, or document a UI restore hook before expanding availability coverage.
