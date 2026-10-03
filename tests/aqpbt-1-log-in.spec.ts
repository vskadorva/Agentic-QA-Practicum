import {
  DashboardPage,
  ForgotPasswordPage,
  FriendsPage,
  LandingPage,
  LoginPage,
} from '../pages';
import { test, expect } from '../fixtures/cleanup.fixture';
import { AppRoute } from '../test-data/routes';
import {
  buildFamilyALoginCredentials,
  buildUnregisteredUserLoginAttempt,
  buildWrongPasswordLoginAttempt,
} from '../test-data/factories/login-credentials.factory';
import { invalidLoginInputs } from '../test-data/invalid-login';

const loginUrlPattern = new RegExp(`${AppRoute.Login}(\\?.*)?$`);
const dashboardUrlPattern = new RegExp(`${AppRoute.Dashboard}(\\?.*)?$`);
const friendsUrlPattern = new RegExp(`${AppRoute.Friends}(\\?.*)?$`);
const forgotPasswordUrlPattern = new RegExp(`${AppRoute.ForgotPassword}(\\?.*)?$`);

test.describe('AQPBT-1 Log in', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('successful sign-in lands on Dashboard', { tag: '@smoke' }, async ({ page }) => {
    const loginPage = new LoginPage(page);
    const credentials = buildFamilyALoginCredentials();
    const dashboardPage = new DashboardPage(page);

    await loginPage.goto();
    await loginPage.submit(credentials.email, credentials.password);

    await expect(page).toHaveURL(dashboardUrlPattern);
    await expect(dashboardPage.dashboardBanner).toBeVisible();
    await expect(dashboardPage.header.logOutButton).toBeVisible();
  });

  test('sign-in honors next redirect to Friends', { tag: '@smoke' }, async ({ page }) => {
    const loginPage = new LoginPage(page);
    const friendsPage = new FriendsPage(page);
    const credentials = buildFamilyALoginCredentials();

    await loginPage.gotoWithNext(AppRoute.Friends);
    await loginPage.submit(credentials.email, credentials.password);

    await expect(page).toHaveURL(friendsUrlPattern);
    await expect(friendsPage.friendsBanner).toBeVisible();
  });

  test('log out returns to the log-in form', { tag: '@regression' }, async ({ browser }) => {
    const context = await browser.newContext({
      storageState: { cookies: [], origins: [] },
      baseURL: process.env.APP_URL,
    });
    const page = await context.newPage();
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    const credentials = buildFamilyALoginCredentials();

    await loginPage.goto();
    await loginPage.submit(credentials.email, credentials.password);
    await expect(page).toHaveURL(dashboardUrlPattern);

    await dashboardPage.header.logOut();

    await expect(page).toHaveURL(loginUrlPattern);
    await expect(loginPage.welcomeHeading).toBeVisible();
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.logInButton).toBeVisible();

    await context.close();
  });

  test('landing page Log in opens log-in', { tag: '@smoke' }, async ({ page }) => {
    const landingPage = new LandingPage(page);
    const loginPage = new LoginPage(page);

    await landingPage.goto();
    await landingPage.openLogIn();

    await expect(page).toHaveURL(loginUrlPattern);
    await expect(loginPage.welcomeHeading).toBeVisible();
  });

  test('Forgot password opens reset screen', { tag: '@regression' }, async ({ page }) => {
    const loginPage = new LoginPage(page);
    const forgotPasswordPage = new ForgotPasswordPage(page);

    await loginPage.goto();
    await loginPage.openForgotPassword();

    await expect(page).toHaveURL(forgotPasswordUrlPattern);
    await expect(forgotPasswordPage.resetHeading).toBeVisible();
  });

  test('Back to log in without sending reset', { tag: '@regression' }, async ({ page }) => {
    const loginPage = new LoginPage(page);
    const forgotPasswordPage = new ForgotPasswordPage(page);

    await loginPage.goto();
    await loginPage.openForgotPassword();
    await forgotPasswordPage.backToLogIn();

    await expect(page).toHaveURL(loginUrlPattern);
    await expect(loginPage.welcomeHeading).toBeVisible();
    await expect(forgotPasswordPage.sendResetLinkButton).not.toBeVisible();
  });

  test('wrong password shows generic error', { tag: '@regression' }, async ({ page }) => {
    const loginPage = new LoginPage(page);
    const attempt = buildWrongPasswordLoginAttempt();

    await loginPage.goto();
    await loginPage.submit(attempt.email, attempt.password);

    await expect(page).toHaveURL(loginUrlPattern);
    await expect(loginPage.invalidCredentialsMessage).toBeVisible();
  });

  test('unregistered email shows the same error', { tag: '@regression' }, async ({ page }) => {
    const loginPage = new LoginPage(page);
    const attempt = buildUnregisteredUserLoginAttempt();

    await loginPage.goto();
    await loginPage.submit(attempt.email, attempt.password);

    await expect(page).toHaveURL(loginUrlPattern);
    await expect(loginPage.invalidCredentialsMessage).toBeVisible();
  });

  test('empty submit stays on log-in without server error', { tag: '@regression' }, async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.submitEmpty();

    await expect(page).toHaveURL(loginUrlPattern);
    await expect(loginPage.invalidCredentialsMessage).not.toBeVisible();
  });

  test('deep link to app when logged out', { tag: '@regression' }, async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    await dashboardPage.goto();

    await expect(page).toHaveURL(loginUrlPattern);
    await expect(loginPage.welcomeHeading).toBeVisible();
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.logInButton).toBeVisible();
  });

  test('malformed email blocked before API error', { tag: '@regression' }, async ({ page }) => {
    const loginPage = new LoginPage(page);
    const { email, password } = invalidLoginInputs.malformedEmail;

    await loginPage.goto();
    await loginPage.submit(email, password);

    await expect(page).toHaveURL(loginUrlPattern);
    await expect(loginPage.invalidCredentialsMessage).not.toBeVisible();
  });

  test('email only, password empty', { tag: '@regression' }, async ({ page }) => {
    const loginPage = new LoginPage(page);
    const { email } = buildFamilyALoginCredentials();

    await loginPage.goto();
    await loginPage.submit(email, invalidLoginInputs.emptyFields.password);

    await expect(page).toHaveURL(loginUrlPattern);
    await expect(loginPage.invalidCredentialsMessage).not.toBeVisible();
  });

  test('password only, email empty', { tag: '@regression' }, async ({ page }) => {
    const loginPage = new LoginPage(page);
    const { password } = invalidLoginInputs.passwordOnly;

    await loginPage.goto();
    await loginPage.submit(invalidLoginInputs.emptyFields.email, password);

    await expect(page).toHaveURL(loginUrlPattern);
    await expect(loginPage.invalidCredentialsMessage).not.toBeVisible();
  });

  test('failed log-in does not follow next', { tag: '@regression' }, async ({ page }) => {
    const loginPage = new LoginPage(page);
    const attempt = buildWrongPasswordLoginAttempt();

    await loginPage.gotoWithNext(AppRoute.Friends);
    await loginPage.submit(attempt.email, attempt.password);

    await expect(page).toHaveURL(loginUrlPattern);
    await expect(loginPage.invalidCredentialsMessage).toBeVisible();
    await expect(page).not.toHaveURL(friendsUrlPattern);
  });
});
