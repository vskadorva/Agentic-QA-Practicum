# Test design: children (`POST` / `DELETE /api/v1/children`)

Source: [CATALOG.md](../CATALOG.md) only. Rows with expected status/body are **executed** characterization cases; others are **assumed — ask** or **not yet tested** with no expected result.

## `POST /api/v1/children`

| ID | type | what we send | expected status | expected body (rule, key values) | source | technique |
| --- | --- | --- | --- | --- | --- | --- |
| CH-POST-01 | positive | Bearer JWT (`apiMain`); JSON with `firstName`, `birthYear`, `birthMonth`, `gender`, `interests` (factory defaults) | 201 | object with `id`, `firstName`, `birthYear`, `birthMonth`, `age`, `gender`, `interests`, `avatarKey`; `firstName` matches request | CATALOG row POST `/api/v1/children` (executed) | — |
| CH-POST-02 | positive | Same as CH-POST-01 with `interests: []` | 201 | same field rule as CH-POST-01 | CATALOG request body: `interests` (array; may be empty) (executed) | — |
| CH-POST-03 | positive | CH-POST-01 then `GET /api/v1/me` (`apiMain`) | 200 on GET | created child `id` and `firstName` present under `family.children[]` | Observed dashboard flow + CH-POST-01; GET `/api/v1/me` row (executed) | state (create then read) |
| CH-POST-04 | negative | `apiAnonymous`; same JSON body as CH-POST-01 | — | — | Not yet tested: unauthenticated POST; § Unauthenticated GET only lists GET routes | families (`apiAnonymous`) |
| CH-POST-05 | negative | `apiAlt`; same JSON body as CH-POST-01 | — | — | **assumed — ask:** Can the alt family create children on its own family? If yes, is undo still `DELETE` by same owner? | families (`apiAlt`) |
| CH-POST-06 | negative | `apiMain`; omit `firstName` | — | — | **assumed — ask:** required-field validation status and error shape? (§ Not yet tested: 4xx body shape) | equivalence classes |
| CH-POST-07 | negative | `apiMain`; `firstName: ""` | — | — | **assumed — ask:** empty string allowed? | equivalence classes |
| CH-POST-08 | negative | `apiMain`; omit `birthYear` | — | — | **assumed — ask:** required-field validation? | equivalence classes |
| CH-POST-09 | negative | `apiMain`; `birthYear` string instead of number | — | — | **assumed — ask:** wrong-type handling? | equivalence classes |
| CH-POST-10 | negative | `apiMain`; `birthMonth: 0` | — | — | **assumed — ask:** valid month range (0 vs 1–12)? | boundary values |
| CH-POST-11 | negative | `apiMain`; `birthMonth: 1` | — | — | **assumed — ask:** lower bound accepted? | boundary values |
| CH-POST-12 | negative | `apiMain`; `birthMonth: 12` | — | — | **assumed — ask:** upper bound accepted? | boundary values |
| CH-POST-13 | negative | `apiMain`; `birthMonth: 13` | — | — | **assumed — ask:** one over max month — 400? | boundary values |
| CH-POST-14 | negative | `apiMain`; `interests` not an array | — | — | **assumed — ask:** wrong-type on `interests`? | equivalence classes |

## `DELETE /api/v1/children/{id}`

| ID | type | what we send | expected status | expected body (rule, key values) | source | technique |
| --- | --- | --- | --- | --- | --- | --- |
| CH-DEL-01 | positive | `apiMain`; `DELETE` `{id}` from CH-POST-01 | 204 | empty body | CATALOG row DELETE `/api/v1/children/{id}` (executed) | state (paired undo after POST) |
| CH-DEL-02 | positive | After CH-DEL-01, `GET /api/v1/me` | 200 | child `id` no longer in `family.children[]` | CH-POST-03 + executed DELETE flow | state (delete then read) |
| CH-DEL-03 | negative | `apiAnonymous`; `DELETE` on disposable `{id}` from CH-POST-01 | — | — | **assumed — ask:** status without token (401 like GETs?) | families (`apiAnonymous`) |
| CH-DEL-04 | negative | `apiAlt`; `DELETE` `{id}` created by `apiMain` (CH-POST-01) | — | — | **assumed — ask:** cross-family delete forbidden (403/404)? | families (`apiAlt` on main-owned id) |
| CH-DEL-05 | error | `apiMain`; `DELETE` with unknown `{id}` (synthetic UUID) | — | — | **assumed — ask:** 404? (not observed in catalog) | error (unknown id) |
| CH-DEL-06 | error | `apiMain`; second `DELETE` on same `{id}` after CH-DEL-01 | — | — | **assumed — ask:** idempotent 204 vs 404? | state (done twice) |

## Catalog gaps (no rows yet — track under **Not yet tested**)

| topic | note |
| --- | --- |
| Error response shape | § Not yet tested — any 4xx/5xx JSON vs plain text for children routes |
| Invalid / expired JWT | § Not yet tested — distinct from missing token |
| `PATCH` or update child | No catalog row — out of scope until discovery adds a route |

**Existing spec note (informational):** `api/children.api.spec.ts` currently implements one flow overlapping CH-POST-01, CH-POST-03, and CH-DEL-01. This design is the full intended matrix; implementation after approval is via api-contract-tests.
