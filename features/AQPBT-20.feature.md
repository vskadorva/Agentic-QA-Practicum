# Feature: [Vitaly] Communities — your communities list and opening a group

As a signed-in parent, I want to see the communities my family belongs to and open one, so that I can get to a class or daycare group quickly — or start my first group if I have none.

# Happy paths

## Scenario: Communities page shows banner, heading, description and + Create group (AC1)

- **Given** I am signed in as Family A
- **When** I open `/communities`
- **Then** the banner shows **Communities**
- **And** I see the heading **Your communities**
- **And** I see the text **Classes, daycares and neighbourhood groups your family belongs to.**
- **And** I see the link **+ Create group**

## Scenario: Family A sees the Maple Class group card (AC2)

- **Given** I am signed in as Family A on `/communities`
- **When** I view the list
- **Then** I see a group card **Maple Class** with the type **Class**
- **And** the card shows the line **4 families · You’re an admin**

## Scenario: Opening Maple Class lands on the group page with tabs (AC3)

- **Given** I am signed in as Family A on `/communities`
- **When** I click **Maple Class**
- **Then** I land on that group's page (`/communities/<group id>`)
- **And** I see the heading **Maple Class**
- **And** I see the tabs **Members** (selected), **Events** and **Announcements**

## Scenario: ← All communities returns to the list (AC4)

- **Given** I am signed in as Family A on the Maple Class page
- **When** I click **← All communities**
- **Then** I am back on `/communities`
- **And** I see **Your communities**

## Scenario: Family B with no communities sees the empty state (AC5)

- **Given** I am signed in as Family B, who belongs to no communities
- **When** I open `/communities`
- **Then** I see **Create a group for a daycare, class or activity**
- **And** I see the link **Create your first group**, which points to `/communities/new`

# Negative

## Scenario: Logged-out visitor is redirected to log in (AC6)

- **Given** I am logged out
- **When** I open `/communities`
- **Then** I am taken to `/login`
- **And** I see **Welcome back**

## Scenario: Family B does not see Family A's Maple Class card (N1)

- **Given** I am signed in as Family B, who belongs to no communities
- **When** I open `/communities`
- **Then** no **Maple Class** group card is shown

## Scenario: Family A with a group does not see the empty state (N2)

- **Given** I am signed in as Family A on `/communities` with the **Maple Class** card shown
- **When** I view the list
- **Then** **Create a group for a daycare, class or activity** and **Create your first group** are not shown

<!--
Ambiguities / gaps:
- No Confluence feature page exists for this story (ticket notes); Jira AC and the live app (checked 2026-11-18) are the only sources.
- "4 families" is live shared data; if another family joins or leaves Maple Class, AC2 fails. The ticket says "4 families observed", so it is asserted literally.
- AC5 depends on Family B (APP_ALT_USER_*) staying in zero communities; tests skip when alt-user credentials are unset.
- AC1 does not say whether + Create group should also point to /communities/new (live app: yes); not asserted beyond visibility.
- AC6 does not say whether /login should keep a `next=/communities` return path; the live app redirects to plain /login, so only the path is asserted.
- Out of scope: the create-group form (AQPBT-3), Invite families / Copy invite link / Connect, and Events/Announcements tab contents.
-->

## For test-writer

- **Suggested spec:** `tests/aqpbt-20-communities-list.spec.ts`
- **POM:** Extend `pages/communities.page.ts` (banner, description text, group card by name, empty-state heading and **Create your first group** link); reuse `pages/community-detail.page.ts` (heading, tabs, **← All communities**) and `pages/login.page.ts` (**Welcome back**)
- **Auth:** Family A via default `storageState`; Family B via `ALT_AUTH_FILE` (skip when missing); logged-out via empty `storageState`
- **Tags:** `@smoke` for AC1; `@sanity` for AC2–AC6 read-only flows; `@regression` for N1/N2; one tag per `test()`
- **Cleanup:** read-only; no records created
