# Explore: Availability — save weekend preset

## Coverage snapshot

| Page / area | Flow (short) | Spec / POM reference | Status |
| ----------- | ------------ | -------------------- | ------ |
| `/availability` | Open page (URL or sidebar) | `AvailabilityPage.goto()`, `HeaderComponent.goToAvailability()` | **Gap** (no spec) |
| Weekly editor | View heading and banner | `heading "Set your weekly free time"`, banner **Availability** | **Gap** |
| Weekly editor | Apply **Weekend afternoons** preset | `AvailabilityPage.applyWeekendAfternoonsPreset()` | **Gap** |
| Weekly editor | **+ Add slot** / per-day **add** | `addSlotButton`, day **add** buttons | **Gap** |
| Weekly editor | Edit slot fields (Day, Start/End time, Kid, Hosting, Notice) | comboboxes / textboxes in snapshot | **Gap** |
| Weekly editor | **Save availability** | `AvailabilityPage.save()` | **Gap** |
| Weekly editor | **remove** slot | `button "remove"` | **Gap** |
| One-off changes | **Add exception** (date, type, note) | `addExceptionButton` | **Gap** |
| One-off changes | List / **remove** exceptions | existing exception rows | **Gap** |
| `/profile` | **My Availability** shortcut | `ProfilePage.myAvailabilityButton` | **Partial** (POM only) |
| Log-in suite | Any availability flow | `tests/aqpbt-1-log-in.spec.ts` | **Gap** |

## Selected gap

**Flow:** Apply the **Weekend afternoons** quick preset and **Save availability** so weekly windows persist.

**Why this run:** Availability has zero Playwright coverage today; saving preset-driven weekly windows is the core setup path for playdate matching and the POM already exposes `applyWeekendAfternoonsPreset()` and `save()`.

## Gherkin test plan

Feature: Weekly availability — weekend preset

As a signed-in parent, I want to apply the weekend afternoons preset and save, so BuddyTime can match playdates against my family's free time.

# Happy path

## Scenario: Weekend afternoons preset saves successfully

- **Given** I am signed in as Family A and on `/availability` with banner **Availability** and heading **Set your weekly free time**
- **When** I click **Weekend afternoons** and then **Save availability**
- **Then** I remain on `/availability` and Saturday (and/or Sunday) weekly rows show saved afternoon time windows after I reload the page

# Edge case

## Scenario: Add exception without a date does not create a row

- **Given** I am signed in on `/availability` in the **One-off changes** section
- **When** I leave the date field empty, keep **Away / closed** selected, and click **Add exception**
- **Then** no new exception row appears in the list below the form

## Locator hints

- Banner: `page.getByRole('banner').filter({ hasText: 'Availability' })` (or extend POM)
- Heading: `page.getByRole('heading', { name: 'Set your weekly free time', level: 2 })`
- Preset: `page.getByRole('button', { name: 'Weekend afternoons' })` — `AvailabilityPage.weekendAfternoonsPreset`
- Save: `page.getByRole('button', { name: 'Save availability' })` — `AvailabilityPage.saveAvailabilityButton`
- Section label: `page.getByText('One-off changes')`
- Exception type: `page.getByRole('combobox').filter({ has: page.locator('option', { hasText: 'Away / closed' }) })` or first combobox in one-off form (confirm scope in POM)
- Add exception: `page.getByRole('button', { name: 'Add exception' })` — `AvailabilityPage.addExceptionButton`
- Saturday row: scope by day label **Sat** then assert `textbox "Start time"` / `textbox "End time"` values after reload

## For test-writer

- **Suggested spec:** `tests/explore-availability-weekly-preset.spec.ts` (or `tests/availability-weekly.spec.ts` after Jira story exists)
- **POM updates:** Add `availabilityBanner` locator; methods `openOneOffSection()` if needed; scoped locators for exception form (date textbox, type combobox, exception list items); helper to read Sat/Sun slot times; optional `reloadAndExpectWeekendSlots()` for happy path assertion — keep asserts in spec
- **Tag:** `@regression` (data mutation) or `@sanity` if run against disposable slot state
- **Cleanup:** No API delete in `api-client.ts` yet — restore prior weekly state via UI (re-save original slots), or document baseline in test setup; follow the **api-cleanup** skill when availability API tracking exists

## Suggested Jira story

- **Title:** Save weekly availability using the Weekend afternoons preset
- **Description:** Parents set recurring free windows on Availability so playdate matching can propose times. The quick **Weekend afternoons** preset should populate weekend slots and **Save availability** should persist them for the signed-in family.
- **Acceptance criteria:**
  - AC1: From `/availability`, clicking **Weekend afternoons** then **Save availability** persists weekend slot times that remain visible after page reload.
  - AC2: In **One-off changes**, clicking **Add exception** with an empty date does not add a new exception row.
