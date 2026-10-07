---
name: self-heal
description: Repairs drifted Playwright locators after a UI change — patch the POM, re-run unchanged assertions, open a PR. Use when the build is red because a locator broke, fix the drifted selector, the test broke after a UI change, or heal the suite. Use ONLY after triage classifies the red run as a test issue (drift/locator drift); NEVER for a real app bug — route those to bug-reporter instead.
---

# Self-heal (locator drift)

Fix **one** broken locator in `pages/` when [ci-failure-triage](../ci-failure-triage/SKILL.md) already classified **test issue (drift)**. Follow [pom-conventions](../pom-conventions/SKILL.md); specs stay read-only.

## Prerequisite

- A completed triage diagnosis classified **test issue (drift)**. If it is a
  real app bug, missing, or ambiguous → stop and route to [jira-bug-reporter](../jira-bug-reporter/SKILL.md).

## Steps

1. From the error and trace, find the failing test, the assertion line (read-only),
   the POM property that supplied the locator, and the old locator exactly as written.
2. Re-discover the element with `browser_navigate` + `browser_snapshot` against
   `APP_URL`: same role, current accessible name. Never guess from screenshots.
3. Patch **only** that locator in the POM (minimal diff; keep role-based; never CSS or
   XPath; never broaden it to make it pass). **One locator per run.**
4. Re-run the failing spec and prove it green with **zero changes under `tests/`.**
5. Open a PR on branch `heal/<short-description>` with the run id, the triage
   classification, the old → new locator diff, the re-run result, and the line
   **"assertions unchanged"**. Do not merge.

**Re-run example:** `npx playwright test <spec-path> -g "<test title>"`

**Auth for re-discovery:** Reuse `playwright/.auth/user.json` or sign in via env credentials (same as explore flows); never put credentials in the PR body.

## Stop and escalate

Stop and escalate if green needs an assertion change, if the same locator error
persists after re-discovery, or if a new failure looks like a product regression.

| Situation | Action |
| --------- | ------ |
| Need to change `expect()` in `tests/` | Stop — not drift-only; re-triage or bug-reporter |
| Locator still not found after snapshot-backed fix | Stop — report findings; do not stack speculative POM edits |
| Test passes but behavior contradicts Jira AC / Confluence | Stop — [jira-bug-reporter](../jira-bug-reporter/SKILL.md) |
| Classification was ambiguous | Stop — complete [ci-failure-triage](../ci-failure-triage/SKILL.md) first |

## Report template

Use in the PR description (and optionally as a PR comment):

```markdown
## Self-heal — locator drift

**Triage classification:** test issue (drift)  
**CI run:** `<run id or local>`  
**Failing test:** `<spec>` — `<title>`

### Locator patch
- **POM:** `pages/<file>.ts` — `<property or constructor line>`
- **Before:** `<old getByRole/getByLabel/...>`
- **After:** `<new locator>`
- **Evidence:** aria snapshot / trace path: …

### Verification
- **Command:** `npx playwright test …`
- **Result:** pass (N/N)
- **assertions unchanged**

### Scope
- Files changed: `pages/` only
- Locators touched: 1
```

## Do / Don't

| Do | Don't |
| -- | ----- |
| Fix one role/label/text locator in `pages/` per heal run | Change assertions, timeouts, or tags in `tests/` to go green |
| Use live `browser_snapshot` on `APP_URL` for the new name/role | Use CSS, XPath, or `getByTestId` unless no user-facing alternative exists |
| Keep the same user intent (same control, updated accessible name) | Broaden locators (`.*`, drop `{ exact: true }`) to mask wrong elements |
| Branch `heal/<short-description>`, PR with triage + diff + re-run proof | Merge the PR or file Jira for pure locator drift |
| Hand off product wrongness to jira-bug-reporter | Weaken, delete, or comment out `expect()` calls |

## Gate

One locator, one POM diff, green re-run, PR opened — then stop. Further failures start a new triage + heal cycle.
