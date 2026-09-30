import type { Locator, Page } from '@playwright/test';

import { AppRoute } from '../test-data/routes';

/** Account sign-up page. */
export class SignUpPage {
  readonly yourNameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly signUpButton: Locator;
  readonly logInLink: Locator;
  readonly termsLink: Locator;
  readonly privacyPolicyLink: Locator;

  constructor(private readonly page: Page) {
    this.yourNameInput = page.getByLabel('Your name');
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Password (8+ characters)');
    this.signUpButton = page.getByRole('button', { name: 'Sign up', exact: true });
    this.logInLink = page.getByRole('link', { name: 'Log in' });
    this.termsLink = page.getByRole('link', { name: 'Terms of Service' });
    this.privacyPolicyLink = page.getByRole('link', { name: 'Privacy Policy' });
  }

  /** Opens the sign-up page. */
  async goto(): Promise<void> {
    await this.page.goto(AppRoute.SignUp);
  }
}
