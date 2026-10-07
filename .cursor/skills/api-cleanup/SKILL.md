---
name: api-cleanup
description: Ensures Playwright tests clean up the data they create. Use whenever generating or reviewing tests that create persistent records in the app under test (BuddyTime availability, playdates, invites, or anything else), so test data does not accumulate in the shared test environment. Apply this to every test that creates data — even if cleanup isn't explicitly requested.
paths: "tests/**"
---

# API cleanup (self-cleaning tests)

Global teardown reads `.test-artifacts/created-records.jsonl` and deletes tracked records with the owning family's auth (`support/global-teardown.ts` → `cleanupCreatedRecords`).

## Steps

1. Import `test` and `expect` from `fixtures/cleanup.fixture.ts`, not from `@playwright/test`.
2. Records created through the UI are tracked automatically from the create response.
   Records created through the API: call `trackRecord({ type, id, owner })` right after
   creation, with owner `"main"` or `"alt"`.
3. No manual `afterAll` cleanup blocks — the fixture and global teardown handle it.
4. Cleanup uses the delete calls in `support/api-client.ts` with the owner family's
   storage state. If a record type has no delete call, the spec uses the UI teardown
   agreed in P10 — never leaves it behind.
5. Never hardcode a credential. Never delete data the test did not create.

## Fixture behavior

- Default `recordOwner` is `"main"` (Family A / `AUTH_FILE`). For Family B flows, set `test.use({ recordOwner: 'alt' })` or pass `{ recordOwner: 'alt' }` on the test so UI-created children track under the correct owner.
- The extended `page` listens for `POST` responses to `API_CHILDREN_PATH` (`/api/v1/children`) with status `201`, reads `id` from the JSON body, and calls `trackRecord`. Mock IDs (prefix from `support/mock-api`) are not tracked.
- Re-exported `trackRecord` is for API-side creates that bypass that response hook.

## Tracked record types

From `support/record-tracker.ts` and `support/api-client.ts` as implemented today:

| type | create request | delete request | owner |
| ---- | -------------- | -------------- | ----- |
| `child` | `POST /api/v1/children` → `201` with `{ id }` in body (UI: auto-tracked by `cleanup.fixture.ts`; API: `trackRecord` after create) | `DELETE /api/v1/children/:id` via `deleteChild` / `deleteTrackedRecord` (`204` success, `404` treated as already absent) | `main` or `alt` |

No other `TrackedRecordType` values exist yet. When adding availability, playdates, invites, etc., extend `record-tracker`, `api-client` delete helpers, and this table together — do not invent endpoints until they exist in `api-client.ts`.

## Review checklist

- [ ] Spec imports from `fixtures/cleanup.fixture.ts`
- [ ] Every persistent create is tracked (UI hook or explicit `trackRecord`)
- [ ] `recordOwner` matches the family that owns the data
- [ ] No `afterAll` / manual delete duplication
- [ ] No credentials in spec; no deleting unrelated records
