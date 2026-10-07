---
name: explore-and-generate
description: Finds untested user flows by diffing live UI exploration against existing Playwright specs. Use when the user says "find what we're not testing", "explore <page> for untested flows", "expand coverage", "what flows are missing", "coverage gap", or asks to discover new test scenarios without a Jira ticket. Do NOT use when a Jira ticket or acceptance criteria already exist — that is jira-ticket-analyzer. This skill is for ticket-less discovery only. Exploration is read-only: map coverage, crawl the UI, propose one Gherkin plan per run; do not write or run Playwright specs here.
---

# Explore and generate (coverage gaps)

Ticket-less discovery only. If the user named a Jira key or AC, stop and use [jira-ticket-analyzer](../jira-ticket-analyzer/SKILL.md).

## Guardrails

- Read-only (no data changes, no invites or approvals, no specs, no test
  runs); one flow per run; accessibility snapshot only, never screenshots; reuse
  `playwright/.auth/user.json` or sign in with the `.env` credentials.

**Auth:** Prefer existing `playwright/.auth/user.json` (main family). If missing or expired, sign in once via the live app using `APP_USER_EMAIL` / `APP_USER_PASSWORD` from env — never echo credentials in output. Do not use Family B unless the target flow requires it (`playwright/.auth/alt-user.json`).

**Browser:** Use Cursor IDE browser MCP — `browser_navigate`, `browser_snapshot` (and minimal clicks to open dialogs/panels). Lock tab during crawl; unlock when done.

## Steps

1. Map covered flows from `tests/*.spec.ts` and `pages/` (page, action, asserted
   outcome).
2. Crawl the target page with `browser_navigate` + `browser_snapshot`, opening
   dialogs and panels only as far as needed.
3. List real user flows (trigger, 2–5 steps, visible outcome).
4. Diff against coverage, labelling each **Gap** or **Partial**.
5. Pick **ONE** highest-value gap and say why in one sentence.
6. Output a Gherkin plan with exactly **two** scenarios (one positive, one edge case), every **Then** assertable in Playwright, real control names from the snapshot.

## Output template

Write the file using these sections (in order):

```markdown
# Explore: <page name> — <flow name>

## Coverage snapshot
| Page / area | Flow (short) | Spec / POM reference | Status |
| ... | ... | ... | Covered / Partial / Gap |

## Selected gap
**Flow:** …  
**Why this run:** … (one sentence)

## Gherkin test plan

Feature: …

# Happy path

## Scenario: …
- **Given** …
- **When** …
- **Then** …

# Edge case

## Scenario: …
- **Given** …
- **When** …
- **Then** …

## Locator hints
- … (role + name from snapshot; note `{ exact: true }` if needed)

## For test-writer
- **Suggested spec:** `tests/<slug>.spec.ts`
- **POM updates:** … (new page methods / locators in `pages/`, no inline locators in spec)
- **Tag:** one of `@smoke` `@sanity` `@regression` … when implemented
- **Cleanup:** [api-cleanup](../api-cleanup/SKILL.md) if the flow creates persistent data

## Suggested Jira story
- **Title:** …
- **Description:** … (user value, scope)
- **Acceptance criteria:** … (bullet list derived from the two scenarios)
```

## Save path

```
features/explore-<page-slug>-<flow-slug>.feature.md
```

Example: `features/explore-friends-invite-family.feature.md`

## Gate

Stop after saving the feature file (or after presenting the plan if the human asked for approval first). Do not write or run Playwright specs in this skill. Implementation follows human approval and [pom-conventions](../pom-conventions/SKILL.md) + [api-cleanup](../api-cleanup/SKILL.md).
