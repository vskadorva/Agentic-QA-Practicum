---
name: ci-failure-triage
description: When a CI run is red, pull the run's logs and the playwright-report artifact via GitHub MCP or GH CLI, read the Playwright error and trace, cross-reference the spec, POM, and app source in the repo, classify real app bug vs test issue, and post a structured diagnosis to the PR. Use whenever a build fails — even if triage isn't asked for.
---

# CI failure triage (Playwright)

Diagnose red CI or local Playwright runs without merging fixes. Name **where** and **why** — not only the assertion text.

## Steps

1. Pull the failed run's logs and the playwright-report artifact (GitHub MCP, or
   `gh run view <id> --log` and `gh run download <id>`). For a local red run, use the
   local report and `test-results/`.
2. Read the error: failing test, expected vs received, trace path. Inspect the trace
   from the command line with `npx playwright trace`. Quote the aria snapshot from the
   error context when Playwright includes one.
3. Cross-reference the spec, the page object, the story's acceptance criteria, and the
   Confluence page. BuddyTime's source isn't in this repo; compare against the
   documented behavior instead.
4. Classify exactly one: **test issue (drift)** | **real app bug** | **ambiguous**.
5. Report: root cause, affected file and line, expected/actual, suggested fix, and
   evidence (trace or screenshot path, run id) — as a PR comment when a PR exists,
   otherwise to the parent agent.

## Classification guide

| Class | Signals |
| ----- | -------- |
| test issue (drift) | Locator/copy/route changed; expectation no longer matches AC; flake from timing; wrong test data; env/credentials in CI config |
| real app bug | App behavior contradicts Jira AC or Confluence; reproduces on re-run; POM/spec align with docs |
| ambiguous | Conflicting docs, cannot repro locally, or missing artifact — state what is needed to decide |

**Real app bug** → hand off to [jira-bug-reporter](../jira-bug-reporter/SKILL.md) after diagnosis (do not file Jira from this skill without that workflow's approval gate).

## Report template

Post this (markdown) on the PR or return to the parent agent:

```markdown
## CI triage — <workflow or job name>

**Run:** `<github run id or "local">`  
**Classification:** test issue (drift) | real app bug | ambiguous

### Failing test
`<spec path>` — `<test title>`

### Root cause
<One paragraph: why it failed, not only what assertion said>

### Location
- **File:line:** `path/to/file.ts:123`
- **Expected:** …
- **Actual:** …

### Evidence
- Trace: …
- Screenshot: …
- Aria snapshot (if any): …

### Suggested fix
<Concrete next step for a human or follow-up agent — no auto-merge>

### AC / docs checked
- Story: AQPBT-N (if known)
- Confluence: … (if linked on story)
```

## Rules

- Never merge or apply a fix yourself; a real defect goes to jira-bug-reporter;
  the diagnosis names the location and the cause, not just the symptom.

## Repo context

- Story keys and AC: Atlassian MCP (`getJiraIssue`); Confluence in `CONFLUENCE_SPACE_KEY` from `.env.example`.
- Specs under `tests/`; locators and actions under `pages/` — no inline locators in specs.
- Do not invent run IDs, artifact names, or ticket keys; use CI output or ask the human.
