# Feature: [Rena] Sign up: create an account with name, email, and password

As a parent or guardian who does not yet have an account, I want to enter my name, email, and password on Create your account and click Sign up, so that BuddyTime can create my account.

Sources: Jira AQPBT-4 acceptance criteria AC1–AC23, and Confluence space AQPBT page **[Rena] Sign up** (https://legionqaschool.atlassian.net/wiki/spaces/AQPBT/pages/308543489/Sign+up). Family A email and password come from `APP_USER_EMAIL` and `APP_USER_PASSWORD` (never hardcoded). Logged-out scenarios start with an empty `storageState`. Signed-in scenarios use the setup project's Family A `storageState`.

Filled **Your name** on validation and duplicate scenarios is `Lev` (the parent name observed on the signed-in app in the Sign up feature page). The 7-character password is `1234567`. The 8-character password used when the browser must accept the password and the server must answer is `12345678` (Confluence: eight digits were not rejected before the duplicate-email check).

# Happy paths

## Scenario: Get started opens sign-up (AC1)

- **Given** I am logged out and on `/`
- **When** I click **Get started**
- **Then** the URL is `/signup`

## Scenario: Sign-up screen shows the create-account form (AC2)

- **Given** I am logged out and on `/signup`
- **Then** the `main` region contains heading **Create your account**, textboxes **Your name**, **Email**, and **Password (8+ characters)**, button **Sign up**, links **Log in**, **Terms of Service**, and **Privacy Policy**, and the text **BuddyTime is for parents and guardians (18+).**

## Scenario: Log in from sign-up keeps the default next path (AC10)

- **Given** I am logged out and on `/signup`
- **When** I click **Log in**
- **Then** the URL is `/login?next=%2Fapp`

## Scenario: Log in from sign-up keeps a friends next path (AC11)

- **Given** I am logged out and on `/signup?next=%2Ffriends`
- **When** I click **Log in**
- **Then** the URL is `/login?next=%2Ffriends`

## Scenario: Signed-in parent still sees Create your account (AC12)

- **Given** I am signed in as Family A
- **When** I open `/signup`
- **Then** heading **Create your account** is visible

## Scenario: Opening sign-up does not replace the Family A session (AC13)

- **Given** I am signed in as Family A and have opened `/signup`
- **When** I open `/app`
- **Then** button **Log out** is visible

## Scenario: New account signs up onto the app (AC14)

- **Given** I am logged out on `/signup` and **Email** is not already registered
- **When** I fill **Your name** with `Signup Parent` plus `Date.now()` (under 100 characters), **Email** with a unique factory address, and **Password (8+ characters)** with a unique password of 8 or more characters, and I click **Sign up** without opening **Terms of Service** or **Privacy Policy**
- **Then** the URL is `/app` and button **Log out** is visible
- **And** the account created in this scenario is removed before the test ends (see teardown note)

## Scenario: New account can log in with the same credentials (AC15)

- **Given** an account was just created the same way as AC14 (its own unique email and password; do not reuse another test's account)
- **When** I am signed out, open `/login`, and click **Log in** with that same **Email** and **Password**
- **Then** the URL is `/app` and button **Log out** is visible
- **And** the account created in this scenario is removed before the test ends

## Scenario: Log in accepts the new account email in a different letter case (AC23)

- **Given** an account was just created the same way as AC14, with a specific **Email**
- **When** I am signed out, open `/login`, and click **Log in** with that **Email** after every letter's case is swapped, and the same **Password**
- **Then** the URL is `/app` and button **Log out** is visible
- **And** the account created in this scenario is removed before the test ends

# Negative

## Scenario: Empty sign-up focuses Your name (AC3)

- **Given** I am logged out on `/signup` and **Your name**, **Email**, and **Password (8+ characters)** are empty
- **When** I click **Sign up**
- **Then** **Your name** has focus
- **And** the URL remains `/signup` (Confluence business rule 1)
- **And** **An account with this email already exists** is not visible

## Scenario: Empty sign-up shows the required-field message (AC21)

- **Given** I am logged out on `/signup` and all three fields are empty
- **When** I click **Sign up**
- **Then** **Your name** shows the validation message `Please fill out this field.`
- **And** the URL remains `/signup`
- **And** **An account with this email already exists** is not visible

## Scenario: Email not-an-email focuses Email (AC4)

- **Given** I am logged out on `/signup`, **Your name** is `Lev`, and **Email** is `not-an-email`
- **When** I click **Sign up**
- **Then** **Email** has focus
- **And** the URL remains `/signup` (Confluence business rule 2)

## Scenario: Email not-an-email shows the missing-at message (AC6)

- **Given** I am logged out on `/signup`, **Your name** is `Lev`, and **Email** is `not-an-email`
- **When** I click **Sign up**
- **Then** the **Email** validation message is `Please include an '@' in the email address. 'not-an-email' is missing an '@'.`
- **And** the URL remains `/signup`

## Scenario: Seven-character password focuses the password field (AC5)

- **Given** I am logged out on `/signup`, **Your name** is `Lev`, **Email** is Family A's email (a well-formed address), and **Password (8+ characters)** is `1234567`
- **When** I click **Sign up**
- **Then** **Password (8+ characters)** has focus
- **And** the URL remains `/signup` (Confluence business rule 3)

## Scenario: Seven-character password shows the length message (AC7)

- **Given** I am logged out on `/signup`, **Your name** is `Lev`, **Email** is Family A's email, and **Password (8+ characters)** is `1234567`
- **When** I click **Sign up**
- **Then** the **Password (8+ characters)** validation message is `Please lengthen this text to 8 characters or more (you are currently using 7 characters).`
- **And** the URL remains `/signup`
- **And** **An account with this email already exists** is not visible (Confluence business rule 3: no register request is sent)

## Scenario: Duplicate Family A email stays on sign-up (AC9)

- **Given** I am logged out on `/signup`
- **When** I enter **Your name** `Lev`, **Password (8+ characters)** `12345678`, and Family A's **Email**, and I click **Sign up**
- **Then** the text **An account with this email already exists** is visible
- **And** the URL remains `/signup` (Confluence business rule 5)
- **And** button **Log out** is not visible

## Scenario: Email missing-at.com is rejected (AC16)

- **Given** I am logged out on `/signup`, **Your name** is `Lev`, and **Password (8+ characters)** is `12345678`
- **When** **Email** is `missing-at.com` and I click **Sign up**
- **Then** **Email** has focus
- **And** its validation message is `Please include an '@' in the email address. 'missing-at.com' is missing an '@'.`
- **And** the URL remains `/signup`

## Scenario: Email user@ is incomplete (AC17)

- **Given** I am logged out on `/signup`, **Your name** is `Lev`, and **Password (8+ characters)** is `12345678`
- **When** **Email** is `user@` and I click **Sign up**
- **Then** **Email** has focus
- **And** its validation message is `Please enter a part following '@'. 'user@' is incomplete.`
- **And** the URL remains `/signup`

## Scenario: Email @example.com is incomplete (AC18)

- **Given** I am logged out on `/signup`, **Your name** is `Lev`, and **Password (8+ characters)** is `12345678`
- **When** **Email** is `@example.com` and I click **Sign up**
- **Then** **Email** has focus
- **And** its validation message is `Please enter a part followed by '@'. '@example.com' is incomplete.`
- **And** the URL remains `/signup`

## Scenario: Email with a space before @ is rejected (AC19)

- **Given** I am logged out on `/signup`, **Your name** is `Lev`, and **Password (8+ characters)** is `12345678`
- **When** **Email** is `spaces @example.com` and I click **Sign up**
- **Then** **Email** has focus
- **And** its validation message is `A part followed by '@' should not contain the symbol ' '.`
- **And** the URL remains `/signup`

## Scenario: Email user@.com places the dot wrong (AC20)

- **Given** I am logged out on `/signup`, **Your name** is `Lev`, and **Password (8+ characters)** is `12345678`
- **When** **Email** is `user@.com` and I click **Sign up**
- **Then** **Email** has focus
- **And** its validation message is `'.' is used at a wrong position in '.com'.`
- **And** the URL remains `/signup`

## Scenario: Family A email with swapped letter case is still a duplicate (AC22)

- **Given** I am logged out on `/signup` and an account already exists for Family A's **Email**
- **When** I enter that **Email** with every letter's case swapped, **Your name** `Lev`, and **Password (8+ characters)** `12345678`, and I click **Sign up**
- **Then** the text **An account with this email already exists** is visible
- **And** the URL remains `/signup`

# Edge cases

## Scenario: Your name longer than 100 characters is stored as 100 (AC8)

- **Given** I am logged out on `/signup`
- **When** I fill **Your name** with 101 `a` characters
- **Then** the field holds exactly 100 characters
- **And** no error sentence is shown (Confluence business rule 4)

## Scenario: Your name of exactly 100 characters is kept (AC8 boundary)

- **Given** I am logged out on `/signup`
- **When** I fill **Your name** with exactly 100 `a` characters
- **Then** the field holds exactly 100 characters

## Scenario: Eight-character password reaches the duplicate check (AC9 boundary)

- **Given** I am logged out on `/signup`, **Your name** is `Lev`, **Email** is Family A's email, and **Password (8+ characters)** is `12345678`
- **When** I click **Sign up**
- **Then** the text **An account with this email already exists** is visible
- **And** the password field's validation message is not `Please lengthen this text to 8 characters or more (you are currently using 7 characters).`
- **And** the URL remains `/signup`

## Scenario: Spaces-only Your name does not show the required-field message (Confluence rule 6)

- **Given** I am logged out on `/signup`, **Your name** is three spaces, **Email** is Family A's email, and **Password (8+ characters)** is `12345678`
- **When** I click **Sign up**
- **Then** **Your name** does not show `Please fill out this field.`
- **And** the text **An account with this email already exists** is visible
- **And** the URL remains `/signup`

<!--
Ambiguities / gaps:
- Account teardown after AC14, AC15, and AC23 is an open question on AQPBT-4. support/api-client.ts deletes children only (DELETE /api/v1/children/:id). Profile already exposes Delete account…, textbox Your password, and button Delete forever (pages/profile.page.ts, pages/components/delete-account-form.component.ts). Use that Profile UI to remove only the account this test created. Do not invent an account-delete API route. If Delete forever does not remove the account, stop and escalate — do not leave the new account in the shared environment and do not weaken assertions.
- AC22–AC23 are in the acceptance criteria and still listed under Open questions until case behavior is confirmed on the test site. Assert the AC text. One swapped-case variant (every letter) covers "local part, domain, or both"; separate local-only and domain-only runs are not additional AC.
- Validation message wording under pinned locale en-CA (playwright.config.ts locale: 'en-CA') for AC6, AC7, and AC16–AC21 is an open question. The AC strings are the expected messages; do not soften them if Chromium en-CA wording differs — that is a triage outcome.
- Duplicate-email sentence staying after Email is edited until Sign up is clicked again is Confluence business rule 7 and an open question ("by design?"). Not an acceptance criterion. Do not automate it as a required scenario.
- Spaces-only Your name with a brand-new email is an open question (invalid or allowed?). Confluence rule 6 only confirms the required-field message does not show, and that an already-registered email still returns the duplicate sentence. The spaces-only scenario above uses Family A's email only.
- Partial empty fields (name filled, email empty, or email filled and password empty beyond AC5) are not in AC1–AC23.
- Whether next on the sign-up URL is honored after a successful Sign up is out of scope. AC14–AC15 expect /app.
- Family B on this screen is out of scope. No second-family scenario.
- Out of scope: email verification and inbox checks, password rules beyond the 8-character minimum, forgot password, guest RSVP / join links, admin latest sign-ups, full legal text of Terms and Privacy (links are presence-only in AC2), and a@nodot-style addresses that HTML5 email validation accepts.
- AC6 states the validation message without its own When. The scenario submits Sign up, matching AC4 and Confluence rule 2, because that is when the browser reports the message.
- Happy-path Your name, email, and password literals are not in the story. The story says to use a factory or Date.now() for email and password. Your name on the happy path is Signup Parent plus Date.now().
-->
