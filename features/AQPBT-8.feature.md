# Feature: [Vitaly] Availability — save weekly free time (Weekend afternoons preset)

As a signed-in parent, I want to apply the **Weekend afternoons** preset and save my weekly availability, so that BuddyTime can match playdates against my family's recurring free time.

# Happy paths

## Scenario: Weekend afternoons preset persists after save and reload (AC1)

- **Given** I am signed in as Family A and on `/availability` with banner **Availability** and heading **Set your weekly free time**
- **When** I click **Weekend afternoons** and then **Save availability**
- **Then** I remain on `/availability`
- **And** after I reload the page, Saturday and/or Sunday weekly rows show saved afternoon **Start time** and **End time** values (non-empty)

# Negative

## Scenario: Add exception with empty date does not create a row (AC2)

- **Given** I am signed in as Family A on `/availability` in the **One-off changes** section
- **When** I leave the date field empty, keep **Away / closed** selected, and click **Add exception**
- **Then** no new exception row appears in the list below the form

## Scenario: Save without applying preset does not fabricate weekend slots from this flow (N1)

- **Given** I am signed in as Family A on `/availability` with no **Weekend afternoons** click in this session
- **When** I click **Save availability** without changing weekly slots via the preset
- **Then** I remain on `/availability` and the page does not show a success state that implies new weekend slots were added solely by save (assert no unexpected new Sat/Sun afternoon windows beyond baseline visible after reload)

# Edge cases

## Scenario: Preset can be applied twice before save without leaving the page (E1)

- **Given** I am signed in as Family A on `/availability`
- **When** I click **Weekend afternoons** twice and then **Save availability**
- **Then** I remain on `/availability` and after reload Saturday and/or Sunday still show persisted afternoon time windows

## Scenario: One-off section visible while weekly editor is in view (E2)

- **Given** I am signed in as Family A on `/availability`
- **When** I scroll to or focus the **One-off changes** section
- **Then** **Add exception** is visible alongside the weekly editor heading **Set your weekly free time**

<!--
Ambiguities / gaps:
- No dedicated Confluence feature page for AQPBT-8 in space AQPBT (only Jira AC and repo explore plan). Feature map Confluence page returned summary excerpt only — exact weekend preset start/end times not confirmed in Confluence.
- AC1 says "Saturday and/or Sunday" — automation should assert at least one weekend day has non-empty afternoon slot times after reload; exact expected times (e.g. 12:00–17:00) must be read from live UI when preset is applied.
- No availability API cleanup in repo yet; tests may need UI restore of prior weekly state per ticket out-of-scope note.
- Baseline weekly state for Family A before preset is unknown — negative scenario N1 may need snapshot of pre-test Sat/Sun fields or skip if baseline varies.
-->

## For test-writer

- **Suggested spec:** `tests/aqpbt-8-availability-weekend-preset.spec.ts`
- **POM:** Extend `pages/availability.page.ts` — banner, heading, one-off section locators, exception list count helper, weekend row slot readers (Sat/Sun **Start time** / **End time**)
- **Auth:** Family A via default `storageState` from setup project
- **Tags:** `@regression` on mutating tests (data changes weekly availability)
- **Cleanup:** Document UI restore or minimal revert if API tracking absent (see `api-cleanup` skill)
