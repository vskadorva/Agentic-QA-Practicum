# Feature: [Vitaly] Landing page — public home links (Get started, Log in, Privacy, Terms)

As a visitor who is not signed in, I want the BuddyTime home page to tell me what the app does and link me to sign up, log in, and the legal pages, so that I can decide to join and know where the privacy policy and terms live.

# Happy paths

## Scenario: Logged-out home shows brand, tagline and public links (AC1)

- **Given** I am logged out
- **When** I open `/`
- **Then** I see **BuddyTime**
- **And** I see the text **See when your kids' friends are free — and book a playdate in three taps.**
- **And** I see the links **Get started**, **Log in**, **Privacy** and **Terms**

## Scenario: Get started opens sign-up (AC2)

- **Given** I am on `/` logged out
- **When** I click **Get started**
- **Then** I land on `/signup` and see the heading **Create your account**

## Scenario: Log in opens the log-in page (AC3)

- **Given** I am on `/` logged out
- **When** I click **Log in**
- **Then** I land on `/login` and see the heading **Welcome back**

## Scenario: Privacy opens the privacy policy (AC4)

- **Given** I am on `/` logged out
- **When** I click **Privacy**
- **Then** I land on `/privacy` and see the heading **Privacy Policy**

## Scenario: Terms opens the terms of service (AC5)

- **Given** I am on `/` logged out
- **When** I click **Terms**
- **Then** I land on `/terms` and see the heading **Terms of Service**

# Negative

## Scenario: Public links do not require sign-in (N1)

- **Given** I am logged out
- **When** I click **Privacy** (or **Terms**) on `/`
- **Then** I am not redirected to `/login`; the URL is `/privacy` (or `/terms`) and its heading is visible

# Edge cases

## Scenario: Browser back from a legal page returns to the home page (E1)

- **Given** I clicked **Terms** on `/` logged out and see **Terms of Service**
- **When** I go back in browser history
- **Then** I am on `/` and still see the **Get started** link

<!--
Ambiguities / gaps:
- No Confluence feature page for AQPBT-19 (ticket notes say so; CQL search of space AQPBT found none). Plan relies on Jira AC only.
- AC1 "I see BuddyTime" — on the live app this is plain text inside main (not a heading/landmark); asserted as visible text, exact match.
- Out of scope per ticket: submitting sign-up/log-in forms (AQPBT-4, AQPBT-1), legal page content beyond the main heading, and what `/` shows to a signed-in parent.
- N1 and E1 are derived (not in the AC); they reuse AC labels only.
-->

## For test-writer

- **Suggested spec:** `tests/aqpbt-19-landing-public-links.spec.ts`
- **POM:** Extend `pages/landing.page.ts` (brand text, tagline, Privacy/Terms actions); reuse `SignUpPage.createAccountHeading` and `LoginPage.welcomeHeading`; small POMs for `/privacy` and `/terms` headings
- **Routes:** add `/privacy` and `/terms` to `AppRoute`
- **Auth:** logged out — `test.use({ storageState: { cookies: [], origins: [] } })`
- **Tags:** read-only; `@smoke` for AC1, `@sanity`/`@regression` for navigation
- **Cleanup:** none — no data created
