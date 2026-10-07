---
name: jira-bug-reporter
description: Analyzes Playwright test failures, identifies root cause, and creates detailed Jira bug tickets. Use when a test fails and needs investigation and bug reporting.
---

# Jira Bug Reporter (Playwright failures)

Turn a failing Playwright run into a reviewed Jira Bug linked to the originating story. BuddyTime application source is not available — describe observable UI/API behavior precisely from the test, trace, and live reproduction.

## Workflow

1. **Read the failure:** assertion message, stack trace, screenshot and trace paths under `test-results/`.
2. **Confirm it reproduces:** re-run the failing test once (e.g. `npx playwright test <path-to-spec> -g "<test title>"`).
3. **Identify the root cause** from the spec, the page object, and the app's behavior (BuddyTime's source is not available to us — describe the behavior precisely).
4. **Search Jira** project `JIRA_PROJECT_KEY` (from `.env.example` or the user's environment, e.g. `AQPBT`) for a similar open bug before drafting a new one. Use Atlassian MCP `searchJiraIssuesUsingJql` — e.g. open bugs in the project whose summary or description matches the failure symptom, component, or Playwright locator text.
5. **Draft** the ticket with:
   - **Title** (specific)
   - **Type:** Bug
   - **Severity**, **Priority**
   - **Steps to reproduce** (numbered, from login, naming which family does what — e.g. Family A / Family B from auth setup, not credentials)
   - **Expected** (from the AC or the Confluence page linked on the story)
   - **Actual**
   - **Environment** (the `APP_URL` host, browser, account role — never an email or password)
   - **Evidence** (screenshot and trace paths)
   - The exact **Playwright error**
   - **Linked story** (`AQPBT-N`)
6. **Show the draft to the human.** File it with the Atlassian MCP only after approval, and link it to the originating story (`createJiraIssue` / issue link or parent as the project uses).

## Triage before filing

| Outcome | Action |
| -------- | ------ |
| Product defect (app wrong vs AC) | Draft bug per workflow |
| Test drift (selectors, timing, wrong expectation) | Fix or heal the test — do **not** file a Jira bug |
| Flaky / env / credentials / data setup | Fix automation or env — do **not** file as product bug |
| Re-run passes with no app change | Investigate flake; do **not** file on a single red without reproduction |

Constitution: triage first; never heal a real bug by weakening assertions.

## Draft template

Present this block to the human for approval:

```markdown
## [Bug title]

**Type:** Bug  
**Severity:** …  
**Priority:** …  
**Linked story:** AQPBT-N

### Steps to reproduce
1. …

### Expected
…

### Actual
…

### Environment
- Host: … (from APP_URL)
- Browser: …
- Role / family: … (no emails or passwords)

### Evidence
- Screenshot: test-results/…
- Trace: test-results/…

### Playwright error
```
(paste exact assertion / error)
```

### Duplicate check
- Searched: …
- Result: none / link to AQPBT-…
```

## Rules

- Never file for a test issue or a green run; never include credentials.
- Read the originating story (and linked Confluence page in `CONFLUENCE_SPACE_KEY` when present) via Atlassian MCP before writing Expected.
- Do not invent ticket keys, custom field values, or UI copy — use repo specs, POMs, failure output, and MCP ticket/Confluence content.
- If a duplicate open bug exists, summarize findings and offer to comment on that issue instead of creating a new one.

## Gate

Stop after presenting the draft unless the human explicitly approves filing. Only then create the Jira issue and confirm the key + link to the story.
