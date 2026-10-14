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
4. Build the evidence file (see **Evidence file** below) — items cite real artifacts with `line` and `excerpt`; never put `score`, `confidence`, or `weight` in the file.
5. Save to `.test-artifacts/evidence/<run>-<test>.json` and copy to `.test-artifacts/evidence/current.json`. Ensure R4: save the Playwright JSON re-run to `.test-artifacts/reruns/<decisionId>.json` (decision id = first 12 hex chars of SHA-256 of the evidence file).
6. Run `npx tsx scripts/score-evidence.ts --verify-only .test-artifacts/evidence/current.json` and report the scorer output (`decision`, `side`, `score`, `rule`, `allowedActions`, `missing`, `contradictions`) — as a PR comment when a PR exists, otherwise to the parent agent. Do not trust a saved decision file or a chat label.

## Evidence signals (for items, not for a human label)

| Scorer side / outcome | Signals |
| ----- | -------- |
| drift items (D1–D4) | Locator/copy/route changed; POM drift; snapshot mismatch; probe not unique |
| bug items (B1–B4) | App behavior contradicts Jira AC or Confluence; server error with AC-aligned spec |
| inconclusive (rule 3) | Re-run **passed** — flaky, not drift |
| inconclusive (other) | Missing required items, drift+bug contradiction, or score below threshold |

**`decision: act` + `side: bug`** → hand off to [jira-bug-reporter](../jira-bug-reporter/SKILL.md) only through gate-approved filing (do not file Jira from this skill).

## Report template

Post this (markdown) on the PR or return to the parent agent:

```markdown
## CI triage — <workflow or job name>

**Run:** `<github run id or "local">`  
**Scorer:** `decision=<act|escalate|inconclusive>` `side=<drift|bug|null>` `score=<n>` `rule=<rule-*>` `allowedActions=[…]`

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

## Evidence file shape

```json
{
  "test": { "file": "tests/example.spec.ts", "title": "example test title" },
  "items": [
    {
      "id": "R1",
      "kind": "failure",
      "artifact": "test-results/.../error-context.md",
      "line": 12,
      "excerpt": "at least eight characters from that line"
    }
  ]
}
```

Never include `score`, `confidence`, or `weight`. Required ids and rubric weights are defined in `config/evidence-rubric.json`.

## Rules

- Never merge or apply a fix yourself; a real defect goes to jira-bug-reporter;
  the diagnosis names the location and the cause, not just the symptom.

## Repo context

- Story keys and AC: Atlassian MCP (`getJiraIssue`); Confluence in `CONFLUENCE_SPACE_KEY` from `.env.example`.
- Specs under `tests/`; locators and actions under `pages/` — no inline locators in specs.
- Do not invent run IDs, artifact names, or ticket keys; use CI output or ask the human.
