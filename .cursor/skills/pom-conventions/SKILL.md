---
name: pom-conventions
description: Page Object Model conventions for Playwright tests in this project. Apply whenever generating, refactoring, or reviewing any Playwright test that interacts with the app under test (BuddyTime) — even if the user doesn't say "POM". Tests should never contain inline locators.
paths: "tests/**, pages/**"
---

# Page Object Model conventions

## Steps

- One class per page or distinct component; locators as `readonly` properties
  set in the constructor (`getByRole`, `getByLabel`, `getByText` — never CSS); methods for
  user actions that do not assert; no `expect()` in `pages/`; compose components inside
  pages; specs import POMs and instantiate them with `new XxxPage(page)`.

## BuddyTime page inventory

Routes from `test-data/routes.ts` (`AppRoute`) and matching `*.page.ts` files under `pages/`:

| Route | Page object | Notes |
| ----- | ----------- | ----- |
| `/` | `LandingPage` | Public marketing landing |
| `/login` | `LoginPage` | Returning parents; supports `gotoWithNext` |
| `/signup` | `SignUpPage` | Account sign-up |
| `/forgot-password` | `ForgotPasswordPage` | Password reset request |
| `/app` | `DashboardPage` | Signed-in home; `header`, `addChildForm`, `inviteLinkPanel` |
| `/calendar` | `CalendarPage` | Family calendar; `header` |
| `/friends` | `FriendsPage` | Trusted circle; `header`, `inviteLinkPanel`, `FriendManageMenuComponent` |
| `/communities` | `CommunitiesPage` | Communities list; `header` |
| `/communities/new` | `CommunitiesNewPage` | Create community; `header`, `CreateCommunityFormComponent` |
| `/communities/15f52f3a-ba2f-46b7-b859-047ed8f6b50f` | `CommunityDetailPage` | Maple Class hub; `gotoMapleClass()`; tabs, group event & announcement forms |
| `/availability` | `AvailabilityPage` | Weekly availability editor; `header` |
| `/playdates` | `PlaydatesPage` | Matching, requests, history; `header`, `ProposePlaydateFormComponent` |
| `/playdates/new` | `PlaydatesNewPage` | Find-a-playdate when circle gate applies; `header` |
| `/birthdays` | `BirthdaysPage` | Birthday party invitations; `header`, `CreatePartyFormComponent` |
| `/profile` | `ProfilePage` | Account, family, settings; `header`, `DeleteAccountFormComponent` |
| `/admin` | `AdminPage` | Internal admin metrics; `header` |

**Components** (`pages/components/`): shared UI fragments (e.g. `HeaderComponent`, forms, menus) — no route; pages hold them as properties, not via inheritance.

Barrel exports today: `pages/index.ts` re-exports `DashboardPage`, `ForgotPasswordPage`, `FriendsPage`, `LandingPage`, `LoginPage` only; other page classes import from their file path until added to the barrel.

## Locator rules

- Scope dialog locators to the dialog; use `{ exact: true }` where labels
  share a prefix; act on rows and cards by accessible name; never hardcode `APP_URL`
  (pages use relative paths; Playwright's `baseURL` comes from `APP_URL`); shared parts
  such as the header are components a page holds — never a base class it extends;
  two-family flows use one page object instance per context.

## Known app issues

Add a row only when the instructor confirms a defect; mark the test with `test.fail(true, '<AQPBT bug key>: <reason>')`.

| AQPBT key | Defect / reason |
| --------- | --------------- |

## Output

Page objects in `pages/`, specs in `tests/` that import them.

### Example POM (`pages/login.page.ts`)

```typescript
import type { Locator, Page } from '@playwright/test';

import { AppRoute } from '../test-data/routes';

/** Log-in page for returning parents. */
export class LoginPage {
  readonly welcomeHeading: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly logInButton: Locator;
  readonly invalidCredentialsMessage: Locator;

  constructor(private readonly page: Page) {
    this.welcomeHeading = page.getByRole('heading', { name: 'Welcome back' });
    this.emailInput = page.getByRole('textbox', { name: 'Email' });
    this.passwordInput = page.getByRole('textbox', { name: 'Password' });
    this.logInButton = page.getByRole('button', { name: 'Log in', exact: true });
    this.invalidCredentialsMessage = page.getByText('Invalid email or password');
  }

  async goto(): Promise<void> {
    await this.page.goto(AppRoute.Login);
  }

  async submit(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.logInButton.click();
  }
}
```

### Example spec (`tests/aqpbt-1-log-in.spec.ts`)

```typescript
import { DashboardPage, LoginPage } from '../pages';
import { test, expect } from '../fixtures/cleanup.fixture';
import { buildFamilyALoginCredentials } from '../test-data/factories/login-credentials.factory';

test('successful sign-in lands on Dashboard', { tag: '@smoke' }, async ({ page }) => {
  const loginPage = new LoginPage(page);
  const dashboardPage = new DashboardPage(page);
  const credentials = buildFamilyALoginCredentials();

  await loginPage.goto();
  await loginPage.submit(credentials.email, credentials.password);

  await expect(dashboardPage.dashboardBanner).toBeVisible();
  await expect(dashboardPage.header.logOutButton).toBeVisible();
});
```

Assertions stay in the spec; the POM only navigates and acts.
