# BuddyTime API catalog (main family)

Captured via Playwright against `https://test.buddytime.ca` while signed in as the main family (session matched `playwright/.auth/user.json` / `GET /api/v1/me` for **The Gorfels**). Calendar (`/calendar`) traffic captured on the same session (headless Playwright, 2026-10-16). Skipped: static assets, fonts, images, Cloudflare RUM (`/cdn-cgi/rum`), and Next.js RSC payloads (`*?_rsc=*`).

**Authentication (all `/api/v1/*` rows):** `Authorization: Bearer <JWT>` on browser `fetch`; token is the `bt_token` value in `localStorage` for the app origin (no session cookies observed in storage state).

| method | path (ids → `{id}`) | page that called it | how it's authenticated | status seen | request body fields (writes) | response top-level fields and types | safe for tests? | evidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| GET | `/api/v1/me` | Dashboard (`/app`), Calendar, Friends, Communities, Availability, Playdates, Birthdays, Profile | Bearer JWT | 200 | — | `parent` (object), `family` (object), `isAdmin` (boolean). `parent`: `id`, `email`, `name`, `displayName`, `phone`, `emailVerified`. `family`: `id`, `name`, `addressText`, `addressVisibility`, `tz`, `parents[]`, `children[]` | yes | executed |
| GET | `/api/v1/connections` | Dashboard, Calendar, Friends, Communities, Availability, Playdates, Birthdays, Profile | Bearer JWT | 200 | — | array of connection objects: `id`, `family` `{id,name}`, `children[]`, `communities[]`, `since`, `status`, `blockedByMe` | yes | executed |
| GET | `/api/v1/availability` | Dashboard, Availability | Bearer JWT | 200 | — | `rules` (array), `exceptions` (array). Rule: `id`, `childId`, `weekday`, `startMin`, `endMin`, `hosting`, `noticeHours`. Exception: `id`, `date`, `kind`, `startMin`, `endMin`, `note` | yes | executed |
| GET | `/api/v1/playdates?filter=upcoming` | Dashboard (`/app`), Calendar (`/calendar`) | Bearer JWT | 200 | — | array (empty `[]` in session) of playdate objects (same shape as unfiltered list when non-empty) | yes | executed |
| GET | `/api/v1/communities` | Dashboard, Communities, Birthdays | Bearer JWT | 200 | — | array of `{id`, `name`, `type`, `description`, `myRole`, `myStatus`, `familiesCount`, `pendingCount`, `createdAt`} | yes | executed |
| GET | `/api/v1/playdates` | Playdates | Bearer JWT | 200 | — | array of playdate objects: `id`, `status`, `startsAt`, `endsAt`, `locationKind`, `locationText`, `notes`, `proposerFamily`, `inviteeFamily`, `otherFamily`, `hostFamily`, `children[]`, `proposedBy`, `respondedAt`, `cancelledAt`, `googleCalendarUrl`, `icsUrl`, `canRespond`, `canCancel` | yes | executed |
| GET | `/api/v1/matches?days={n}` | Playdates (`days=21`) | Bearer JWT | 200 | — | array of slots: `date`, `startMin`, `endMin`, `startsAt`, `endsAt`, `family` `{id,name}`, `suggestedHost` `{id,name}` \| null, `locationKind` | yes | executed |
| GET | `/api/v1/events` | Birthdays, Calendar (`/calendar`) | Bearer JWT | 200 | — | array of event objects: `id`, `kind`, `title`, `childId` (string \| null), `childName` (string \| null), `startsAt`, `endsAt` (string \| null), `venueText` (string \| null), `details` (string \| null), `cardKey`, `status`, `communityId` (string \| null), `communityName` (string \| null), `rsvpToken`, `counts` `{yes,no,maybe,guestsComing}`, `createdAt`, `canManage` | yes | executed |
| GET | `/api/v1/communities/{id}` | Birthdays (prefetch for default community on create form) | Bearer JWT | 200 | — | community object plus `members[]` (each: `id`, `family`, `role`, `status`, `children[]`, `connection`, `since`) | yes | executed |
| POST | `/api/v1/children` | Dashboard (add-child form) | Bearer JWT | 201 | `firstName`, `birthYear`, `birthMonth`, `gender`, `interests` (array; may be empty) | created child object: `id`, `firstName`, `birthYear`, `birthMonth`, `age`, `gender`, `interests`, `avatarKey` | yes (paired with DELETE undo) | executed |
| DELETE | `/api/v1/children/{id}` | Dashboard (remove on same disposable child) | Bearer JWT | 204 | — (no body) | empty body | yes | executed |
| GET | `/api/v1/playdates/{id}/ics` | — (URL present on playdate rows as `icsUrl`) | Bearer JWT (assumed same as other API calls) | — | — | not observed | yes (read-only) | inspected only |
| POST | `/api/v1/events` | — | Bearer JWT | — | not observed in UI pass (see `create-party-form.component.ts` / birthdays specs) | `201` + `{ id }` per test helpers | no (create without undo in this pass) | inspected only |
| POST | `/api/v1/events/{id}/cancel` | — | Bearer JWT | — | not observed (used in `aqpbt-6` cleanup helpers) | not observed | yes if used after create in same test | inspected only |

## Unauthenticated GET responses

Probed without an `Authorization` header (see `api/*.api.spec.ts` and `UNAUTHENTICATED_GET_STATUS`):

| method | path | status (no token) |
| --- | --- | --- |
| GET | `/api/v1/me` | 401 |
| GET | `/api/v1/connections` | 401 |
| GET | `/api/v1/availability` | 401 |
| GET | `/api/v1/playdates?filter=upcoming` | 401 |
| GET | `/api/v1/communities` | 401 |
| GET | `/api/v1/playdates` | 401 |
| GET | `/api/v1/matches?days={n}` | 401 |
| GET | `/api/v1/events` | 401 |
| GET | `/api/v1/communities/{id}` | 401 |

## Not yet tested

- Pagination, cursors, or `limit`/`offset` on list endpoints (`connections`, `playdates`, `events`, `communities`, `matches`).
- Error response shape (4xx/5xx JSON vs plain text) for any route.
- Rate limiting or throttling headers/behavior.
- Expired or invalid JWT behavior (distinct from missing token).
- Other query variants (`/api/v1/matches` with `days` ≠ 21, `/api/v1/playdates` filters besides `upcoming`).
- Calendar (`/calendar`) month prev/next controls — no additional `/api/v1/*` requests observed after initial load (navigation appears client-side over the fetched payloads).
- Write paths not exercised: availability save, playdate propose/accept/decline/cancel, profile/family PATCH, invite-link generation, notifications, admin APIs, account delete.
- `POST /api/v1/events` request field list and success payload beyond `id` (only referenced from tests/POM, not executed here).
