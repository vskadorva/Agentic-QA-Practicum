# Feature: [Irina] Dashboard — manage kids (Change avatar, remove, add-child form)

As a signed-in parent on my family dashboard, I want to manage my children's avatars, remove a child from our profile, and use the add-child form, so that our family info stays accurate for matching and playdates.

# Happy paths

## Scenario: Dashboard family block shows children, controls, and My Kids count (AC1)

- **Given** I am signed in as Family A and on `/app` with banner **Dashboard**
- **When** the page finishes loading the family block
- **Then** I see our family name and my parent display name
- **And** each existing child row shows a summary line `{name}, {age} · {Boy|Girl}`, interest tags where set, **Change avatar**, and **remove**
- **And** the add-child block shows **Child's first name**, **Birth year**, **Month**, **Interests (comma-separated)**, **Gender**, avatar icon buttons **Fox** through **Ball**, interest shortcuts **+ LEGO** through **+ Crafts**, and **Add child**
- **And** **My Kids** shows the same numeric count as listed child rows

## Scenario: Change avatar opens icon grid, gender combobox, and done (AC2)

- **Given** I am signed in as Family A on `/app` with at least one child row
- **When** I activate **Change avatar** on that child
- **Then** I see icon buttons **Fox**, **Dino**, **Robot**, **Cat**, **Penguin**, **Unicorn**, **Bear**, **Bunny**, **Frog**, **Owl**, **Lion**, **Panda**, **Whale**, **Ladybug**, **Rocket**, and **Ball**
- **And** I see a gender combobox with **Prefer not to say**, **Boy**, and **Girl**
- **And** I see **done**

## Scenario: Done without changing avatar closes editor and preserves row (AC3)

- **Given** I am signed in as Family A on `/app` and the avatar editor is open for a child
- **When** I activate **done** without selecting a different icon
- **Then** the avatar editor closes
- **And** that child row still shows the same summary line and interest tags as before the editor opened

## Scenario: + LEGO appends LEGO to interests field (AC4)

- **Given** I am signed in as Family A on `/app` at the add-child form
- **When** I activate **+ LEGO**
- **Then** **Interests (comma-separated)** contains **LEGO**

# Negative

## Scenario: Add child with required fields empty focuses Birth year and does not add a row (AC5)

- **Given** I am signed in as Family A on `/app` with add-child required fields empty
- **When** I activate **Add child**
- **Then** focus moves to **Birth year**
- **And** the listed child row count is unchanged
- **And** **My Kids** count is unchanged

## Scenario: Partial add-child fill without valid submit does not create a child (N1)

- **Given** I am signed in as Family A on `/app`
- **When** I fill **Child's first name** only, activate **+ LEGO**, and do not complete birth year, month, and gender
- **Then** **Interests (comma-separated)** contains **LEGO**
- **And** no new child row appears and **My Kids** is unchanged

# Edge cases

## Scenario: Remove child drops row and decrements My Kids (AC6)

- **Given** I am signed in as Family A on `/app` with a disposable child row created for this test (API arrange preferred)
- **When** I activate **remove** on that child
- **Then** that child's row is no longer shown
- **And** **My Kids** decreases by one on the same page view without leaving `/app`

## Scenario: Avatar editor closes when Change avatar is toggled again (E1)

- **Given** I am signed in as Family A on `/app` with the avatar editor open for a child
- **When** I activate **Change avatar** on the same child again
- **Then** the inline avatar editor is no longer expanded (same as closed state after **done**)

<!--
Ambiguities / gaps:
- Family A family name, parent display name, and baseline child rows come from live data (APP_USER_*), not fixed literals in Jira.
- AC6 removes a child — use API-created disposable child + @destructive (--workers=1) or equivalent self-contained arrange; do not remove unrelated baseline children without restore.
- Successful **Add child** submit is explicitly out of scope (Jira + Confluence).
- No confirm/undo step on **remove** (Confluence open question — none observed).
- Exact age calculation from Birth year + Month not specified (Confluence open question).
- `/profile` kids list is out of scope.
- Co-parent concurrent edit not tested.
-->

## For test-writer

- **Suggested spec:** `tests/aqpbt-5-dashboard-manage-kids.spec.ts`
- **POM:** Extend `pages/dashboard.page.ts` — family name/parent locators, **My Kids** stat reader, child row helpers (summary, tags, **remove**), reuse `AddChildFormComponent` and `AvatarPickerComponent`; add constants/enums for avatar names and **+ …** chips if repeated
- **Auth:** Family A via default `storageState` from setup project
- **Tags:** `@smoke` for AC1 loadout; `@sanity` for read-only editor/chip/focus flows; `@destructive` for AC6 remove (workers=1); one tag per `test()`
- **Cleanup:** Import from `fixtures/cleanup.fixture.ts`; for remove test, arrange disposable child via API if POST payload is confirmed from network/docs, track with `trackRecord` — UI remove already deletes; teardown 404 is OK
