import { LandingPage, LoginPage, PrivacyPage, TermsPage } from '../pages';
import { SignUpPage } from '../pages/signup.page';
import { test, expect } from '../fixtures/cleanup.fixture';
import { AppRoute } from '../test-data/routes';

const homeUrlPattern = new RegExp(`${AppRoute.Home}(\\?.*)?$`);
const signUpUrlPattern = new RegExp(`${AppRoute.SignUp}(\\?.*)?$`);
const loginUrlPattern = new RegExp(`${AppRoute.Login}(\\?.*)?$`);
const privacyUrlPattern = new RegExp(`${AppRoute.Privacy}(\\?.*)?$`);
const termsUrlPattern = new RegExp(`${AppRoute.Terms}(\\?.*)?$`);

test.describe('AQPBT-19 Landing page public links', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('logged-out home shows brand, tagline and public links', { tag: '@smoke' }, async ({ page }) => {
    const landingPage = new LandingPage(page);

    await landingPage.goto();

    await expect(page).toHaveURL(homeUrlPattern);
    await expect(landingPage.brandText).toBeVisible();
    await expect(landingPage.tagline).toBeVisible();
    await expect(landingPage.getStartedLink).toBeVisible();
    await expect(landingPage.logInLink).toBeVisible();
    await expect(landingPage.privacyLink).toBeVisible();
    await expect(landingPage.termsLink).toBeVisible();
  });

  test('Get started opens sign-up', { tag: '@sanity' }, async ({ page }) => {
    const landingPage = new LandingPage(page);
    const signUpPage = new SignUpPage(page);

    await landingPage.goto();
    await landingPage.openSignUp();

    await expect(page).toHaveURL(signUpUrlPattern);
    await expect(signUpPage.createAccountHeading).toBeVisible();
  });

  test('Log in opens the log-in page', { tag: '@sanity' }, async ({ page }) => {
    const landingPage = new LandingPage(page);
    const loginPage = new LoginPage(page);

    await landingPage.goto();
    await landingPage.openLogIn();

    await expect(page).toHaveURL(loginUrlPattern);
    await expect(loginPage.welcomeHeading).toBeVisible();
  });

  test('Privacy opens the privacy policy', { tag: '@sanity' }, async ({ page }) => {
    const landingPage = new LandingPage(page);
    const privacyPage = new PrivacyPage(page);

    await landingPage.goto();
    await landingPage.openPrivacy();

    await expect(page).toHaveURL(privacyUrlPattern);
    await expect(privacyPage.privacyPolicyHeading).toBeVisible();
  });

  test('Terms opens the terms of service', { tag: '@sanity' }, async ({ page }) => {
    const landingPage = new LandingPage(page);
    const termsPage = new TermsPage(page);

    await landingPage.goto();
    await landingPage.openTerms();

    await expect(page).toHaveURL(termsUrlPattern);
    await expect(termsPage.termsOfServiceHeading).toBeVisible();
  });

  test('public links do not require sign-in', { tag: '@regression' }, async ({ page }) => {
    const landingPage = new LandingPage(page);
    const privacyPage = new PrivacyPage(page);
    const termsPage = new TermsPage(page);

    await landingPage.goto();
    await landingPage.openPrivacy();

    await expect(page).toHaveURL(privacyUrlPattern);
    await expect(page).not.toHaveURL(loginUrlPattern);
    await expect(privacyPage.privacyPolicyHeading).toBeVisible();

    await landingPage.goto();
    await landingPage.openTerms();

    await expect(page).toHaveURL(termsUrlPattern);
    await expect(page).not.toHaveURL(loginUrlPattern);
    await expect(termsPage.termsOfServiceHeading).toBeVisible();
  });

  test('browser back from a legal page returns to the home page', { tag: '@regression' }, async ({ page }) => {
    const landingPage = new LandingPage(page);
    const termsPage = new TermsPage(page);

    await landingPage.goto();
    await landingPage.openTerms();
    await expect(termsPage.termsOfServiceHeading).toBeVisible();

    await page.goBack();

    await expect(page).toHaveURL(homeUrlPattern);
    await expect(landingPage.getStartedLink).toBeVisible();
  });
});
