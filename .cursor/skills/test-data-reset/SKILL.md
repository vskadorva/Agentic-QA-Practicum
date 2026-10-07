---
name: test-data-reset
description: Deletes records that Playwright tests created in the app under test, using the delete calls in support/api-client.ts. Use only when the user explicitly asks to reset test data after an interrupted run left records behind.
disable-model-invocation: true
---

# Test data reset (tracked records only)

Manual cleanup when global teardown did not run. Deletes **only** rows in `.test-artifacts/created-records.jsonl` via [support/api-client.ts](../../../support/api-client.ts) — same as [api-cleanup](../api-cleanup/SKILL.md) global teardown. Never delete data the tracker did not record.

## When to use

Only when the user **explicitly** asks to reset test data after an interrupted run left records behind.

## Workflow

1. **Confirm intent** with the user (destructive on tracked IDs only).
2. **Check auth files** exist for owners in the tracker:
   - `playwright/.auth/user.json` (main)
   - `playwright/.auth/alt-user.json` (alt, if any alt-owned records)
   If missing: `npx playwright test --project=setup`
3. **Dry-run first** unless the user already confirmed a live delete:
   ```bash
   npx tsx .cursor/skills/test-data-reset/scripts/reset-test-data.ts --dry-run
   ```
4. **Run delete** (optional `--type child` when only one type exists today):
   ```bash
   npx tsx .cursor/skills/test-data-reset/scripts/reset-test-data.ts
   npx tsx .cursor/skills/test-data-reset/scripts/reset-test-data.ts --type child
   ```
5. Interpret results:
   - **401** → storage state expired; re-run setup, then retry
   - **404** → already removed (counts as deleted)
   - Script clears the tracker after a non-dry-run (even if some deletes failed)

Requires `APP_URL` in `.env` (same as Playwright).

## Script

Run from **repo root**:

| Flag | Behavior |
| ---- | -------- |
| *(default)* | Delete every tracked record using its owner's storage state |
| `--dry-run` | List targets; delete nothing; do not reset tracker |
| `--type <type>` | Only records of that type (e.g. `child`) |

Implementation: `.cursor/skills/test-data-reset/scripts/reset-test-data.ts` — reuses `support/api-client.ts` and `support/record-tracker.ts`; no duplicated API logic.

## Result template

Report to the user after the run:

```text
Scope · Found · Deleted · Failed
<type scope or "all tracked"> · <n> · <n> · <n>
```

Example:

```text
Scope · Found · Deleted · Failed
all tracked · 2 · 2 · 0
```

## Rules

- Never delete a record the tracker did not record
- Do not run proactively after every test run (teardown handles normal runs)
- No spec changes, no Jira filing from this skill
