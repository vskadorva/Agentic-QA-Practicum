# Eval report

**Generated:** 2026-11-18  
**Window:** last N=30 `playwright.yml` runs requested — **not retrievable** (no `GH_TOKEN`/`GITHUB_TOKEN` or GitHub MCP in this backlog run); PRs #1–#11 from local `origin/main` merge history (2026-10-09 → 2026-10-16)  
**Trigger:** generation PR (AQPBT-20, backlog mode) + stale (previous report 2026-10-13, >14 days)

## Summary

| Metric | Value | How measured | Interpretation |
| ------ | ----- | ------------ | -------------- |
| Flake rate | **insufficient data** | `gh run list` / `gh run view --log` unavailable (no GitHub token) | Cannot count retry-only passes without run logs |
| Heal success rate | **0/1 strict** (first-CI status: **insufficient data**) | `git log origin/main --merges` → one `heal/*` PR (#8); `git diff` of its merge | Heal touched `tests/` (tag changes) as well as `pages/`, so it fails the POM-only rule; masked regressions **0** |
| Generation-gate pass rate | **insufficient data** (conformance 5/5) | Ticket-first spec PRs #2, #3, #4, #6 plus AQPBT-20; one-tag-per-test and no `describe()` tags checked with `rg` | All conform on tags; CI-green leg of the gate cannot be verified without `gh pr checks` |
| Ask vs guess | **mostly grounded** (1 session reviewed) | This AQPBT-20 backlog session | Every UI string, route and family state was confirmed via Jira AC and live accessibility snapshots before writing code; no invented values |

## Details

### Flake rate

Run logs and the Playwright reporter output are needed to count tests that passed only on retry (`retries: 2` in CI). This run has no GitHub API credentials, so `gh run list --workflow=playwright.yml --limit 30` failed. **insufficient data.** Cleanup 404s remain excluded from any future count.

### Heal success rate

`origin/heal/login-button` (PR #8, merged 2026-10-13) is the only heal PR in history. Its merge diff changes `pages/login.page.ts` (button name `Login` → `Log in`) **and** re-tags one test each in `tests/aqpbt-1-log-in.spec.ts` (`@smoke` → `@sanity`) and `tests/aqpbt-5-dashboard-manage-kids.spec.ts` (`@sanity` → `@regression`). No `expect(` lines were added, removed or edited → **masked regressions: 0**. Because the diff is not POM-only, it does not count toward the numerator: **0/1**. First-CI result on the PR is **insufficient data** (no `gh pr checks`).

### Generation-gate pass rate

| PR | Ticket | Spec | Tests / tags | CI on PR |
| --- | --- | --- | --- | --- |
| #2 | AQPBT-8 | `tests/aqpbt-8-availability-weekend-preset.spec.ts` | 4 / 4 | insufficient data |
| #3 | AQPBT-6 | `tests/aqpbt-6-birthdays-create-party.spec.ts` | 16 / 16 | insufficient data |
| #4 | AQPBT-4 | `tests/aqpbt-4-sign-up.spec.ts` | 26 / 26 | insufficient data |
| #6 | AQPBT-5 | `tests/aqpbt-5-dashboard-manage-kids.spec.ts` | 8 / 8 | insufficient data |
| new (draft) | AQPBT-20 | `tests/aqpbt-20-communities-list.spec.ts` | 8 / 8 | local run 10/10 passed (incl. setup), CI pending |

The previous report recorded green PR CI for #2–#4 (runs 38011999469, 38013667848, 38266029056); those could not be re-verified this refresh. AQPBT-20 maps all 6 AC plus 2 negatives (N1, N2) from `features/AQPBT-20.feature.md`. A gate percentage needs the CI leg for every row → **insufficient data**.

### Ask vs guess

One session reviewed (this AQPBT-20 backlog run). The Jira ticket said no Confluence page exists, and that was recorded as a gap. Group data ("4 families · You’re an admin"), the empty-state copy for Family B, and the logged-out redirect to `/login` were all confirmed in live accessibility snapshots before planning. Missing GitHub credentials were reported rather than worked around. The sample is too small for a firm tier.

## Top reliability risk

The AQPBT-20 AC2 and AC5 assertions depend on shared live data: Maple Class must keep exactly 4 families, and Family B must stay in zero communities. Any spec or person that joins, leaves or creates a group with these accounts will turn them red without a product change. Separately, CI metrics are unmeasurable from backlog runs that have no GitHub token.

## Next action

Pass `GH_TOKEN` (or `CURSOR_GH_MCP`) to the backlog runner so PRs can be opened and this report can pull `playwright.yml` run logs. Then re-run this skill to fill in the flake rate and the CI leg of the generation gate.
