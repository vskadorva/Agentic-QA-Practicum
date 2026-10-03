# Feature: [Vitaly] Log in: sign in with email and password to reach the signed-in app

As a registered parent, I want to log in with my email and password, so that I can reach my BuddyTime dashboard and the rest of the signed-in app.

# Happy paths

## Scenario: Successful sign-in lands on Dashboard (AC1)

- **Given** I am logged out and on `/login`
- **When** I enter the registered Family A email and password and click **Log in**
- **Then** I leave `/login` and land on `/app` with banner **Dashboard** and **Log out** visible

## Scenario: Sign-in honors next redirect to Friends (AC2)

- **Given** I am logged out and on `/login?next=%2Ffriends`
- **When** I enter the registered Family A email and password and click **Log in**
- **Then** I land on `/friends` with banner **Friends**

## Scenario: Log out returns to the log-in form (AC7)

- **Given** I am signed in on the app
- **When** I click **Log out** in the app banner
- **Then** I am on `/login` with **Welcome back** and the log-in form

## Scenario: Landing page Log in opens log-in (AC8)

- **Given** I am on `/`
- **When** I click **Log in**
- **Then** I am on `/login` with heading **Welcome back**

## Scenario: Forgot password opens reset screen (AC9)

- **Given** I am on `/login`
- **When** I click **Forgot password?**
- **Then** I am on `/forgot-password` with **Reset your password**

## Scenario: Back to log in without sending reset (AC9)

- **Given** I opened `/forgot-password` from log-in
- **When** I click **← Back to log in**
- **Then** I am on `/login` again without having clicked **Send reset link**

# Negative

## Scenario: Wrong password shows generic error (AC3)

- **Given** I am on `/login`
- **When** I enter the registered Family A email and an incorrect password and click **Log in**
- **Then** I remain on `/login` and see **Invalid email or password**

## Scenario: Unregistered email shows the same error (AC4)

- **Given** I am on `/login`
- **When** I enter an email that is not registered and any password and click **Log in**
- **Then** I remain on `/login` and see **Invalid email or password**

## Scenario: Empty submit stays on log-in without server error (AC5)

- **Given** I am on `/login`
- **When** I click **Log in** without filling **Email** and **Password**
- **Then** I remain on `/login` and do not see **Invalid email or password**

## Scenario: Deep link to app when logged out (AC6)

- **Given** I am logged out
- **When** I open `/app`
- **Then** I am taken to `/login` and see **Welcome back**, **Email**, **Password**, and **Log in**

# Edge cases

## Scenario: Malformed email blocked before API error (E1)

- **Given** I am on `/login`
- **When** I enter a malformed email and any password and click **Log in**
- **Then** I remain on `/login` and do not see **Invalid email or password**

## Scenario: Email only, password empty (E2)

- **Given** I am on `/login`
- **When** I enter the registered Family A email and leave **Password** empty and click **Log in**
- **Then** I remain on `/login` and do not see **Invalid email or password**

## Scenario: Password only, email empty (E3)

- **Given** I am on `/login`
- **When** I enter a password and leave **Email** empty and click **Log in**
- **Then** I remain on `/login` and do not see **Invalid email or password**

## Scenario: Failed log-in does not follow next (E4)

- **Given** I am on `/login?next=%2Ffriends`
- **When** I enter the registered Family A email and an incorrect password and click **Log in**
- **Then** I remain on `/login`, see **Invalid email or password**, and do not land on `/friends`

<!--
Ambiguities / gaps:
- Family A email/password literals are not in Jira; automation uses APP_USER_* env vars.
- AC3/AC4: any incorrect / unregistered values — factories generate unique attempts.
- E1 malformed email: not in Jira AC; behavior documented in test-data/invalid-login.ts.
- E2/E3: single empty field — not specified in AC5 (both empty only).
- AC5 vs HTML5 validation: unclear whether empty submit hits the server.
- Confluence full page body was not available via MCP beyond excerpt.
- Out of scope: sign up, Send reset link, session persistence, SSO, Family B validation.
- AC3 and AC4 share the same error copy (no user enumeration).
-->
