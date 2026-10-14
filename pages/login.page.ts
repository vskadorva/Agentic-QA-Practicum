import type { Locator, Page } from '@playwright/test';

import { AppRoute } from '../test-data/routes';

/** Log-in page for returning parents. */
export class LoginPage {
  readonly welcomeHeading: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly logInButton: Locator;
  readonly signUpLink: Locator;
  readonly forgotPasswordLink: Locator;
  readonly invalidCredentialsMessage: Locator;

  constructor(private readonly page: Page) {
    this.welcomeHeading = page.getByRole('heading', { name: 'Welcome back' });
    this.emailInput = page.getByRole('textbox', { name: 'Email' });
    this.passwordInput = page.getByRole('textbox', { name: 'Password' });
    this.logInButton = page.getByRole('button', { name: 'Log in', exact: true });
    this.signUpLink = page.getByRole('link', { name: 'Sign up' });
    this.forgotPasswordLink = page.getByRole('link', { name: 'Forgot password?' });
    this.invalidCredentialsMessage = page.getByText('Invalid email or password');
  }

  /** Opens the log-in page. */
  async goto(): Promise<void> {
    await this.page.goto(AppRoute.Login);
  }

  /** Opens log-in with a post-auth redirect (`next` query). */
  async gotoWithNext(nextPath: string): Promise<void> {
    const next = encodeURIComponent(nextPath);
    await this.page.goto(`${AppRoute.Login}?next=${next}`);
  }

  /** Submits the form with empty fields. */
  async submitEmpty(): Promise<void> {
    await this.logInButton.click();
  }

  /** Signs in with email and password. */
  async submit(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.logInButton.click();
  }

  /** Opens the forgot-password flow. */
  async openForgotPassword(): Promise<void> {
    await this.forgotPasswordLink.click();
  }
}
