import type { Page } from '@playwright/test';

import { DashboardPage, LandingPage, LoginPage } from '../pages';
import { ProfilePage } from '../pages/profile.page';
import { SignUpPage } from '../pages/signup.page';
import { test, expect } from '../fixtures/cleanup.fixture';
import { AppRoute } from '../test-data/routes';
import { buildFamilyALoginCredentials } from '../test-data/factories/login-credentials.factory';
import {
  buildUniqueSignUpAccount,
  buildYourNameOfLength,
  signUpYourNameMaxLength,
  swapLetterCase,
} from '../test-data/factories/signup-account.factory';
import type { SignUpAccount } from '../test-data/factories/signup-account.factory';
import { invalidSignUpInputs, signUpValidationMessages } from '../test-data/invalid-signup';

const signUpUrlPattern = new RegExp(`${AppRoute.SignUp}(\\?.*)?$`);
const dashboardUrlPattern = new RegExp(`${AppRoute.Dashboard}(\\?.*)?$`);
const loginNextAppUrlPattern = new RegExp(
  `${AppRoute.Login}\\?next=${encodeURIComponent(AppRoute.Dashboard)}$`,
);
const loginNextFriendsUrlPattern = new RegExp(
  `${AppRoute.Login}\\?next=${encodeURIComponent(AppRoute.Friends)}$`,
);

/**
 * AQPBT-4 teardown ambiguity: support/api-client.ts deletes children only.
 * Remove only this test's account through Profile (Delete account…, Your password, Delete forever).
 */
async function deleteCreatedAccount(page: Page, account: SignUpAccount): Promise<void> {
  const loginPage = new LoginPage(page);
  const dashboardPage = new DashboardPage(page);
  const profilePage = new ProfilePage(page);
  const pathname = new URL(page.url()).pathname;

  if (pathname !== AppRoute.Dashboard && pathname !== AppRoute.Profile) {
    await loginPage.goto();
    await loginPage.submit(account.email, account.password);
  }

  await dashboardPage.header.goToProfile();
  await profilePage.openDeleteAccount();
  await profilePage.deleteAccountForm.fillPassword(account.password);
  await profilePage.deleteAccountForm.deleteForever();
}

/** Signs up a unique account, runs the rest of the scenario, then deletes that account only. */
async function signUpAndDelete(
  page: Page,
  afterSignUp: (account: SignUpAccount) => Promise<void>,
): Promise<void> {
  const signUpPage = new SignUpPage(page);
  const dashboardPage = new DashboardPage(page);
  const account = buildUniqueSignUpAccount();
  let reachedApp = false;
  let scenarioError: unknown;

  try {
    await signUpPage.goto();
    await signUpPage.submit(account.name, account.email, account.password);
    await expect(page).toHaveURL(dashboardUrlPattern);
    reachedApp = true;
    await expect(dashboardPage.header.logOutButton).toBeVisible();
    await afterSignUp(account);
  } catch (error) {
    scenarioError = error;
    throw error;
  } finally {
    if (reachedApp) {
      try {
        await deleteCreatedAccount(page, account);
      } catch (cleanupError) {
        if (!scenarioError) {
          throw cleanupError;
        }
      }
    }
  }
}

test.describe('AQPBT-4 Sign up logged out', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('Get started opens sign-up', { tag: '@smoke' }, async ({ page }) => {
    const landingPage = new LandingPage(page);

    await landingPage.goto();
    await landingPage.openSignUp();

    await expect(page).toHaveURL(signUpUrlPattern);
  });

  test('sign-up screen shows the create-account form', { tag: '@smoke' }, async ({ page }) => {
    const signUpPage = new SignUpPage(page);

    await signUpPage.goto();

    await expect(signUpPage.createAccountHeading).toBeVisible();
    await expect(signUpPage.yourNameInput).toBeVisible();
    await expect(signUpPage.emailInput).toBeVisible();
    await expect(signUpPage.passwordInput).toBeVisible();
    await expect(signUpPage.signUpButton).toBeVisible();
    await expect(signUpPage.logInLink).toBeVisible();
    await expect(signUpPage.termsLink).toBeVisible();
    await expect(signUpPage.privacyPolicyLink).toBeVisible();
    await expect(signUpPage.parentGuardianNotice).toBeVisible();
  });

  test('Log in from sign-up keeps the default next path', { tag: '@regression' }, async ({ page }) => {
    const signUpPage = new SignUpPage(page);

    await signUpPage.goto();
    await signUpPage.openLogIn();

    await expect(page).toHaveURL(loginNextAppUrlPattern);
  });

  test('Log in from sign-up keeps a friends next path', { tag: '@regression' }, async ({ page }) => {
    const signUpPage = new SignUpPage(page);

    await signUpPage.gotoWithNext(AppRoute.Friends);
    await signUpPage.openLogIn();

    await expect(page).toHaveURL(loginNextFriendsUrlPattern);
  });

  test('new account signs up onto the app', { tag: '@smoke' }, async ({ page }) => {
    await signUpAndDelete(page, async () => {});
  });

  test('new account can log in with the same credentials', { tag: '@regression' }, async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    await signUpAndDelete(page, async (account) => {
      await dashboardPage.header.logOut();
      await expect(dashboardPage.header.logOutButton).toBeHidden();
      await loginPage.goto();
      await loginPage.submit(account.email, account.password);

      await expect(page).toHaveURL(dashboardUrlPattern);
      await expect(dashboardPage.header.logOutButton).toBeVisible();
    });
  });

  test(
    'Log in accepts the new account email in a different letter case',
    { tag: '@regression' },
    async ({ page }) => {
      const loginPage = new LoginPage(page);
      const dashboardPage = new DashboardPage(page);

      await signUpAndDelete(page, async (account) => {
        await dashboardPage.header.logOut();
        await expect(dashboardPage.header.logOutButton).toBeHidden();
        await loginPage.goto();
        await loginPage.submit(swapLetterCase(account.email), account.password);

        await expect(page).toHaveURL(dashboardUrlPattern);
        await expect(dashboardPage.header.logOutButton).toBeVisible();
      });
    },
  );

  test('empty sign-up focuses Your name', { tag: '@regression' }, async ({ page }) => {
    const signUpPage = new SignUpPage(page);

    await signUpPage.goto();
    await signUpPage.submitEmpty();

    await expect(signUpPage.yourNameInput).toBeFocused();
    await expect(page).toHaveURL(signUpUrlPattern);
    await expect(signUpPage.duplicateEmailMessage).not.toBeVisible();
  });

  test('empty sign-up shows the required-field message', { tag: '@regression' }, async ({ page }) => {
    const signUpPage = new SignUpPage(page);

    await signUpPage.goto();
    await signUpPage.submitEmpty();

    await expect(signUpPage.yourNameInput).toHaveJSProperty(
      'validationMessage',
      signUpValidationMessages.requiredField,
    );
    await expect(page).toHaveURL(signUpUrlPattern);
    await expect(signUpPage.duplicateEmailMessage).not.toBeVisible();
  });

  test('email not-an-email focuses Email', { tag: '@regression' }, async ({ page }) => {
    const signUpPage = new SignUpPage(page);

    await signUpPage.goto();
    await signUpPage.submit(invalidSignUpInputs.parentName, invalidSignUpInputs.notAnEmail, '');

    await expect(signUpPage.emailInput).toBeFocused();
    await expect(page).toHaveURL(signUpUrlPattern);
  });

  test('email not-an-email shows the missing-at message', { tag: '@regression' }, async ({ page }) => {
    const signUpPage = new SignUpPage(page);

    await signUpPage.goto();
    await signUpPage.submit(
      invalidSignUpInputs.parentName,
      invalidSignUpInputs.notAnEmail,
      '',
    );

    await expect(signUpPage.emailInput).toHaveJSProperty(
      'validationMessage',
      signUpValidationMessages.missingAtNotAnEmail,
    );
    await expect(page).toHaveURL(signUpUrlPattern);
  });

  test('seven-character password focuses the password field', { tag: '@regression' }, async ({ page }) => {
    const signUpPage = new SignUpPage(page);
    const { email } = buildFamilyALoginCredentials();

    await signUpPage.goto();
    await signUpPage.submit(
      invalidSignUpInputs.parentName,
      email,
      invalidSignUpInputs.sevenCharacterPassword,
    );

    await expect(signUpPage.passwordInput).toBeFocused();
    await expect(page).toHaveURL(signUpUrlPattern);
  });

  test('seven-character password shows the length message', { tag: '@regression' }, async ({ page }) => {
    const signUpPage = new SignUpPage(page);
    const { email } = buildFamilyALoginCredentials();

    await signUpPage.goto();
    await signUpPage.submit(
      invalidSignUpInputs.parentName,
      email,
      invalidSignUpInputs.sevenCharacterPassword,
    );

    await expect(signUpPage.passwordInput).toHaveJSProperty(
      'validationMessage',
      signUpValidationMessages.passwordTooShort,
    );
    await expect(page).toHaveURL(signUpUrlPattern);
    await expect(signUpPage.duplicateEmailMessage).not.toBeVisible();
  });

  test('duplicate Family A email stays on sign-up', { tag: '@regression' }, async ({ page }) => {
    const signUpPage = new SignUpPage(page);
    const dashboardPage = new DashboardPage(page);
    const { email } = buildFamilyALoginCredentials();

    await signUpPage.goto();
    await signUpPage.submit(
      invalidSignUpInputs.parentName,
      email,
      invalidSignUpInputs.eightCharacterPassword,
    );

    await expect(signUpPage.duplicateEmailMessage).toBeVisible();
    await expect(page).toHaveURL(signUpUrlPattern);
    await expect(dashboardPage.header.logOutButton).not.toBeVisible();
  });

  test('email missing-at.com is rejected', { tag: '@regression' }, async ({ page }) => {
    const signUpPage = new SignUpPage(page);

    await signUpPage.goto();
    await signUpPage.submit(
      invalidSignUpInputs.parentName,
      invalidSignUpInputs.missingAt,
      invalidSignUpInputs.eightCharacterPassword,
    );

    await expect(signUpPage.emailInput).toBeFocused();
    await expect(signUpPage.emailInput).toHaveJSProperty(
      'validationMessage',
      signUpValidationMessages.missingAtDotCom,
    );
    await expect(page).toHaveURL(signUpUrlPattern);
  });

  test('email user@ is incomplete', { tag: '@regression' }, async ({ page }) => {
    const signUpPage = new SignUpPage(page);

    await signUpPage.goto();
    await signUpPage.submit(
      invalidSignUpInputs.parentName,
      invalidSignUpInputs.userAt,
      invalidSignUpInputs.eightCharacterPassword,
    );

    await expect(signUpPage.emailInput).toBeFocused();
    await expect(signUpPage.emailInput).toHaveJSProperty(
      'validationMessage',
      signUpValidationMessages.incompleteAfterAt,
    );
    await expect(page).toHaveURL(signUpUrlPattern);
  });

  test('email @example.com is incomplete', { tag: '@regression' }, async ({ page }) => {
    const signUpPage = new SignUpPage(page);

    await signUpPage.goto();
    await signUpPage.submit(
      invalidSignUpInputs.parentName,
      invalidSignUpInputs.atExample,
      invalidSignUpInputs.eightCharacterPassword,
    );

    await expect(signUpPage.emailInput).toBeFocused();
    await expect(signUpPage.emailInput).toHaveJSProperty(
      'validationMessage',
      signUpValidationMessages.incompleteBeforeAt,
    );
    await expect(page).toHaveURL(signUpUrlPattern);
  });

  test('email with a space before @ is rejected', { tag: '@regression' }, async ({ page }) => {
    const signUpPage = new SignUpPage(page);

    await signUpPage.goto();
    await signUpPage.submit(
      invalidSignUpInputs.parentName,
      invalidSignUpInputs.spaceBeforeAt,
      invalidSignUpInputs.eightCharacterPassword,
    );

    await expect(signUpPage.emailInput).toBeFocused();
    await expect(signUpPage.emailInput).toHaveJSProperty(
      'validationMessage',
      signUpValidationMessages.spaceBeforeAt,
    );
    await expect(page).toHaveURL(signUpUrlPattern);
  });

  test('email user@.com places the dot wrong', { tag: '@regression' }, async ({ page }) => {
    const signUpPage = new SignUpPage(page);

    await signUpPage.goto();
    await signUpPage.submit(
      invalidSignUpInputs.parentName,
      invalidSignUpInputs.dotWrongPosition,
      invalidSignUpInputs.eightCharacterPassword,
    );

    await expect(signUpPage.emailInput).toBeFocused();
    await expect(signUpPage.emailInput).toHaveJSProperty(
      'validationMessage',
      signUpValidationMessages.dotWrongPosition,
    );
    await expect(page).toHaveURL(signUpUrlPattern);
  });

  test('Family A email with swapped letter case is still a duplicate', { tag: '@regression' }, async ({
    page,
  }) => {
    const signUpPage = new SignUpPage(page);
    const { email } = buildFamilyALoginCredentials();

    await signUpPage.goto();
    await signUpPage.submit(
      invalidSignUpInputs.parentName,
      swapLetterCase(email),
      invalidSignUpInputs.eightCharacterPassword,
    );

    await expect(signUpPage.duplicateEmailMessage).toBeVisible();
    await expect(page).toHaveURL(signUpUrlPattern);
  });

  test('Your name longer than 100 characters is stored as 100', { tag: '@regression' }, async ({ page }) => {
    const signUpPage = new SignUpPage(page);
    const maxName = buildYourNameOfLength(signUpYourNameMaxLength);
    const overMaxName = buildYourNameOfLength(signUpYourNameMaxLength + 1);

    await signUpPage.goto();
    await signUpPage.typeYourName(overMaxName);

    await expect(signUpPage.yourNameInput).toHaveValue(maxName);
    await expect(signUpPage.yourNameInput).toHaveJSProperty('validationMessage', '');
    await expect(signUpPage.duplicateEmailMessage).not.toBeVisible();
  });

  test('Your name of exactly 100 characters is kept', { tag: '@regression' }, async ({ page }) => {
    const signUpPage = new SignUpPage(page);
    const maxName = buildYourNameOfLength(signUpYourNameMaxLength);

    await signUpPage.goto();
    await signUpPage.fillYourName(maxName);

    await expect(signUpPage.yourNameInput).toHaveValue(maxName);
  });

  test('eight-character password reaches the duplicate check', { tag: '@regression' }, async ({ page }) => {
    const signUpPage = new SignUpPage(page);
    const { email } = buildFamilyALoginCredentials();

    await signUpPage.goto();
    await signUpPage.submit(
      invalidSignUpInputs.parentName,
      email,
      invalidSignUpInputs.eightCharacterPassword,
    );

    await expect(signUpPage.duplicateEmailMessage).toBeVisible();
    await expect(signUpPage.passwordInput).not.toHaveJSProperty(
      'validationMessage',
      signUpValidationMessages.passwordTooShort,
    );
    await expect(page).toHaveURL(signUpUrlPattern);
  });

  test(
    'spaces-only Your name does not show the required-field message',
    { tag: '@regression' },
    async ({ page }) => {
      const signUpPage = new SignUpPage(page);
      const { email } = buildFamilyALoginCredentials();

      await signUpPage.goto();
      await signUpPage.submit(
        invalidSignUpInputs.spacesOnlyName,
        email,
        invalidSignUpInputs.eightCharacterPassword,
      );

      await expect(signUpPage.yourNameInput).not.toHaveJSProperty(
        'validationMessage',
        signUpValidationMessages.requiredField,
      );
      await expect(signUpPage.duplicateEmailMessage).toBeVisible();
      await expect(page).toHaveURL(signUpUrlPattern);
    },
  );
});

test.describe('AQPBT-4 Sign up signed in', () => {
  test('signed-in parent still sees Create your account', { tag: '@regression' }, async ({ page }) => {
    const signUpPage = new SignUpPage(page);

    await signUpPage.goto();

    await expect(signUpPage.createAccountHeading).toBeVisible();
  });

  test('opening sign-up does not replace the Family A session', { tag: '@regression' }, async ({ page }) => {
    const signUpPage = new SignUpPage(page);
    const dashboardPage = new DashboardPage(page);

    await signUpPage.goto();
    await dashboardPage.goto();

    await expect(dashboardPage.header.logOutButton).toBeVisible();
  });
});
