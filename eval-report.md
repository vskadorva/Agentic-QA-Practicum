# Eval report

**Generated:** 2026-10-12  
**Window:** last N=30 requested; 15 `playwright.yml` runs exist (2026-10-10T00:39:46Z–2026-10-10T01:52:05Z); PRs #1–#3 through 2026-10-10  
**Trigger:** generation PR (this session, AQPBT-4) plus prior generation PRs #2 and #3

## Summary

| Metric | Value | How measured | Interpretation |
| ------ | ----- | ------------ | -------------- |
| Flake rate | 0/285 | Playwright HTML report `stats.flaky` on all 13 green runs in the window (artifacts `playwright-report-regression`) | No test passed only on retry; two red runs were excluded because they did not pass |
| Heal success rate | 0/0 | `gh pr list --state all` — no `heal/*` branches | No heal activity; masked-regression count is 0 |
| Generation-gate pass rate | 2/2 | PRs #2 (AQPBT-8) and #3 (AQPBT-6): CI green, one tag per `test()`, POM under `pages/`, AC named in the PR body | Both merged ticket-first specs passed the gate; AQPBT-4 is local-green and not in this denominator until its PR has CI |
| Ask vs guess | mostly grounded (2 sessions) | Prior eval note for AQPBT-8; this session's AQPBT-4 plan vs Jira AC1–AC23 and Confluence page 308543489 | Values came from the ticket, Confluence, or existing factories; unknowns were written into the plan instead of new API routes |

## Details

### Flake rate

Passing runs (13), flaky tests / tests reported:

| Run | Tests | Flaky |
| --- | ----- | ----- |
| 38010075527 | 17 | 0 |
| 38010583827 | 17 | 0 |
| 38011031408 | 17 | 0 |
| 38011104246 | 17 | 0 |
| 38011294937 | 17 | 0 |
| 38011913863 | 21 | 0 |
| 38011922340 | 21 | 0 |
| 38011997584 | 21 | 0 |
| 38011999469 | 21 | 0 |
| 38012478164 | 21 | 0 |
| 38013667848 | 37 | 0 |
| 38014192450 | 21 | 0 |
| 38014822471 | 37 | 0 |

Total 0/285. Each test's report `results` length was 1 (no retry attempts recorded). Job logs omit the Playwright summary because the workflow uses the cleanup reporter plus HTML; counts above are from the HTML report zip inside each artifact.

Excluded (not passing runs): 38010004091 and 38010208811, both `failure` on main pushes while the workflow was being added. They are not in the flake denominator.

### Heal success rate

No pull requests use a `heal/*` branch. No self-heal PR bodies. Numerator and denominator are both 0. No diff showed an `expect` removed or commented out on a heal PR, because there were none.

### Generation-gate pass rate

- **PR #2** ([AQPBT-8](https://legionqaschool.atlassian.net/browse/AQPBT-8)): `features/AQPBT-8.feature.md`, `tests/aqpbt-8-availability-weekend-preset.spec.ts`, tags `@regression` / `@sanity` on each `test()` only. CI run 38011999469 succeeded.
- **PR #3** ([AQPBT-6](https://legionqaschool.atlassian.net/browse/AQPBT-6)): body maps acceptance criteria 1–16; `tests/aqpbt-6-birthdays-create-party.spec.ts` uses `@regression` once per test. CI run 38013667848 succeeded.
- **PR #1** is the test-generation workflow, not a ticket spec. Not counted.
- **AQPBT-4 (this session):** `npx playwright test tests/aqpbt-4-sign-up.spec.ts --workers=1 --reporter=line` → 28 passed (2 setup + 26 spec) in 28.5s, exit 0. Not included in 2/2 because the pull request CI result does not exist yet.

### Ask vs guess

AQPBT-8 (prior report): Confluence had no dedicated availability page; scenario N1 was omitted rather than guessing Family A baseline slots.

AQPBT-4 (this session): Jira REST because Atlassian MCP was unauthenticated. Acceptance criteria AC1–AC23 and Confluence **[Rena] Sign up** (page 308543489) supplied routes, labels, and validation sentences. Family A credentials stay in `APP_USER_*`. Unique emails reuse `buildUnregisteredLoginEmail` (`@example.com`). Account deletion uses the existing Profile controls (**Delete account…**, **Your password**, **Delete forever**); no account-delete path was added to `support/api-client.ts`. Open questions that are not acceptance criteria (duplicate-message persistence, spaces-only name with a new email, Family B) were left in the plan comment and not turned into extra pass/fail scenarios. The human was not asked mid-run; backlog mode continued from the ticket text.

## Top reliability risk

AQPBT-4 happy-path tests create real accounts and only click **Delete forever**. Nothing asserts the account is gone afterward, and `support/api-client.ts` still cannot delete a user. A click that does not finish deletion would leave accounts in the shared environment while the spec stays green. AQPBT-8 `@regression` tests still mutate Family A weekly availability without API cleanup.

## Next action

After the AQPBT-4 pull request CI finishes, confirm those runs stay at flaky 0. If signup accounts remain after **Delete forever**, add a post-delete check that uses only a route already in the app or `api-client` — do not invent a delete endpoint to force green.
