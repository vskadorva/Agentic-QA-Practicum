# Authorization probe plan (family B vs family A)

**Actor mapping:** `apiMain` = family A (main), `apiAlt` = family B (alt), `apiAnonymous` = no token.

**Id discovery:** All resource ids from `apiMain` responses in `api/authz-probe.api.spec.ts` setup (no literals).

## Planned attempts

| # | endpoint | who | expected (catalog) | notes |
| --- | --- | --- | --- | --- |
| 1 | `POST /api/v1/children` | `apiMain` | 201 | Disposable child; `trackRecord` owner main |
| 2 | `GET /api/v1/me` | `apiMain` | 200 | Capture family A `id` / name for leak checks |
| 3 | `GET /api/v1/communities` | `apiMain` | 200 | Resolve `{id}` for detail probes |
| 4 | `GET /api/v1/playdates` | `apiMain` | 200 | Resolve playdate `{id}` for ICS if non-empty |
| 5 | `DELETE /api/v1/children/{id}` | `apiAlt` | 404 | Child remains on A `/me`; B `/me` never had id |
| 6 | `GET /api/v1/me` | `apiMain` | 200 | Owner follow-up after attempt 5 |
| 7 | `GET /api/v1/me` | `apiAlt` | 200 | Alt must not gain child id |
| 8 | `DELETE /api/v1/children/{id}` | `apiAnonymous` | 401 | Child remains on A `/me` |
| 9 | `GET /api/v1/me` | `apiMain` | 200 | Owner follow-up after attempt 8 |
| 10 | `GET /api/v1/communities/{id}` | `apiAlt` | **undocumented** | Cross-family read using A's community id |
| 11 | `GET /api/v1/communities/{id}` | `apiAnonymous` | 401 | § Unauthenticated GET responses |
| 12 | `GET /api/v1/playdates/{id}/ics` | `apiAlt` | **undocumented** | Skip if no playdate id (deferred) |
| 13 | `GET /api/v1/playdates/{id}/ics` | `apiAnonymous` | **undocumented** | Skip if no playdate id (deferred) |

**Request budget:** 13 max (9 if playdates list empty). Under 20 cap.

## Deferred (budget / no `{id}` cross-family surface)

- List endpoints (`/connections`, `/availability`, `/events`, `/matches`, `/playdates?filter=upcoming`) — scoped to authenticated family; no cross-family id parameter in catalog.
- Writes other than disposable child POST/DELETE (playdates, events, availability, profile).
- Invalid/expired JWT variants.
