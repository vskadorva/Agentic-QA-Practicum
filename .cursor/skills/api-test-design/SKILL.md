---
name: api-test-design
description: Designs API test cases as a table a human approves, from api/CATALOG.md only (no OpenAPI or external spec), before any test code exists. Use when the user asks what to test for an endpoint or an area of the API, asks for test cases, test ideas, a test plan, or coverage. Writes api/test-design/<area>.md and stops for approval. Do NOT use to write test code — that is api-contract-tests.
paths: "api/**"
---

# API test design

Design test cases only. Do not write or edit `api/*.api.spec.ts` or other test code.

**Source of truth:** [api/CATALOG.md](../../api/CATALOG.md) — main table, **Unauthenticated GET responses**, and **Not yet tested**. There is no formal API specification in this repo.

**Expected results:** copy status and body rules only from catalog rows whose `evidence` is **executed** (characterization tests — pin observed behavior). Rows marked **inspected only**, or anything listed under **Not yet tested**, get no expected status or body unless the human has since executed the call and updated the catalog.

## Steps

1. Read the endpoints for the area in `api/CATALOG.md` (and linked sections above).
2. Write `api/test-design/<area>.md`, one table per endpoint:

   | ID | type (positive / negative / error) | what we send | expected status | expected body (rule, key values) | source (CATALOG.md row or section) | technique |

3. **Positive:** for **executed** rows, the main success case the catalog already observed; add one row per documented query variant or field option only when the catalog records it as **executed**.
4. **Negative**, with the technique named in its column:
   - **boundary values:** 0, smallest valid value, exactly at a limit, one over it (e.g. invalid `days`, birth year/month edges for `POST /api/v1/children` when catalog documents the field);
   - **equivalence classes:** one row per kind of bad input (missing field, empty string, wrong type, negative number) — expected outcome only if **executed** or explicitly recorded; otherwise mark **assumed — ask** with no expected result;
   - **state:** the step done in the wrong order or done twice (e.g. DELETE after DELETE, use id after DELETE);
   - **families:** same request as a positive row but (a) **`apiAlt`** on a resource id created by **`apiMain`** when the catalog marks the route safe and a create/undo path exists for main; (b) **`apiAnonymous`** — no `Authorization` header (use **Unauthenticated GET responses** for GET routes already probed; other methods → **assumed — ask** unless catalog shows a status).
5. **Errors:** unknown id → 404 only if observed; business-rule violations → 400 only when the catalog records that status for that rule. Otherwise **assumed — ask** with the question, no expected result.
6. **Not documented in catalog:** a row marked **assumed — ask** (or **not yet tested** when copied from the catalog’s list), with the open question, and **no** expected status or body.
7. **Stop.** Show the table and wait for the human to answer "approved" or ask for changes. Write no test code. After approval, implementation belongs to [api-contract-tests](../api-contract-tests/SKILL.md).
