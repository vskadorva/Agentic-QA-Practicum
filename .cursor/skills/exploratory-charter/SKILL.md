---
name: exploratory-charter
description: Turns a feature name and a risk into a session charter and a blank findings template. Use when the user asks for an exploratory charter, session charter, exploratory testing plan, or wants to structure a time-boxed exploration before or after clicking through the app. The tester supplies the thinking; this skill only enforces the format.
---

# Exploratory session charter

**Format only** — never invent risks, oracles, or findings.

## Required inputs

- **Feature** and **risk** (ask if missing).
- **Optional:** time box, scope in/out, ticket key, Confluence page, page URL.

Do not proceed without feature + risk from the human. Optional fields stay blank or `(not provided)` — do not fill them with guesses.

## Workflow

1. Collect required and optional inputs.
2. Write the charter + findings sections below into one file (human fills **Oracles**, **Areas to probe**, **Notes before start**, and all finding rows during/after the session).
3. Save as `charters/<feature-slug>.md` (create `charters/` if needed). Use a lowercase, hyphenated slug from the feature name.

## Charter template

```markdown
# Session charter: <Feature>

| Field | Value |
| ----- | ----- |
| **Feature** | |
| **Risk** | |
| **Time box** | |
| **In scope** | |
| **Out of scope** | |
| **Ticket** | |
| **Confluence** | |
| **Page URL** | |

## Mission

<!-- One paragraph: what this session must learn or disprove. Human writes. -->

## Oracles (human)

<!-- How you will judge pass/fail: AC, product rules, comparable flows, heuristics. Human writes. -->

## Areas to probe (human)

<!-- Bulleted list of flows, states, or data combinations to touch. Human writes. -->

## Notes before start

<!-- Environment, account role/family, starting URL, data preconditions. Human writes. -->

---

## Findings

| # | Type (bug / question / note) | Area | Observation | Severity | Follow-up |
| --- | --- | --- | --- | --- | --- |
| 1 | | | | | |

<!-- Add rows during the session. Do not pre-populate observations. -->

## Coverage

- **Tried:**
- **Not tried:**
- **Charter done?** (yes / no / partial — human)
```

## Gate

- Do **not** write specs, file bugs, or run tests here.
- After save, stop. Follow-up: [jira-bug-reporter](../jira-bug-reporter/SKILL.md) for confirmed defects; [explore-and-generate](../explore-and-generate/SKILL.md) for automation gap discovery; [jira-ticket-analyzer](../jira-ticket-analyzer/SKILL.md) when a ticket already defines AC.
