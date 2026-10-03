import type { Locator, Page } from '@playwright/test';

import { AppRoute } from '../test-data/routes';

/** Password reset request page. */
export class ForgotPasswordPage {
  readonly resetHeading: Locator;
  readonly emailInput: Locator;
  readonly sendResetLinkButton: Locator;
  readonly backToLogInLink: Locator;

  constructor(private readonly page: Page) {
    this.resetHeading = page.getByRole('heading', { name: 'Reset your password' });
    this.emailInput = page.getByLabel('Email');
    this.sendResetLinkButton = page.getByRole('button', { name: 'Send reset link' });
    this.backToLogInLink = page.getByRole('link', { name: '← Back to log in' });
  }

  /** Opens the forgot-password page. */
  async goto(): Promise<void> {
    await this.page.goto(AppRoute.ForgotPassword);
  }

  /** Returns to log in without sending a reset email. */
  async backToLogIn(): Promise<void> {
    await this.backToLogInLink.click();
  }
}
