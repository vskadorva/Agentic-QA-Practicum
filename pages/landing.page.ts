import type { Locator, Page } from '@playwright/test';

import { AppRoute } from '../test-data/routes';

/** Public marketing landing page. */
export class LandingPage {
  readonly getStartedLink: Locator;
  readonly logInLink: Locator;
  readonly privacyLink: Locator;
  readonly termsLink: Locator;

  constructor(private readonly page: Page) {
    this.getStartedLink = page.getByRole('link', { name: 'Get started' });
    this.logInLink = page.getByRole('link', { name: 'Log in' });
    this.privacyLink = page.getByRole('link', { name: 'Privacy' });
    this.termsLink = page.getByRole('link', { name: 'Terms' });
  }

  /** Opens the public home page. */
  async goto(): Promise<void> {
    await this.page.goto(AppRoute.Home);
  }

  /** Navigates to sign up via the hero CTA. */
  async openSignUp(): Promise<void> {
    await this.getStartedLink.click();
  }

  /** Navigates to log in via the hero link. */
  async openLogIn(): Promise<void> {
    await this.logInLink.click();
  }
}
