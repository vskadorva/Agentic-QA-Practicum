import type { Locator, Page } from '@playwright/test';

import { AppRoute } from '../test-data/routes';

/** Account sign-up page. */
export class SignUpPage {
  readonly createAccountHeading: Locator;
  readonly yourNameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly signUpButton: Locator;
  readonly logInLink: Locator;
  readonly termsLink: Locator;
  readonly privacyPolicyLink: Locator;
  readonly parentGuardianNotice: Locator;
  readonly duplicateEmailMessage: Locator;

  constructor(private readonly page: Page) {
    const main = page.getByRole('main');
    this.createAccountHeading = main.getByRole('heading', { name: 'Create your account' });
    this.yourNameInput = main.getByRole('textbox', { name: 'Your name' });
    this.emailInput = main.getByRole('textbox', { name: 'Email', exact: true });
    this.passwordInput = main.getByRole('textbox', { name: 'Password (8+ characters)' });
    this.signUpButton = main.getByRole('button', { name: 'Sign up', exact: true });
    this.logInLink = main.getByRole('link', { name: 'Log in', exact: true });
    this.termsLink = main.getByRole('link', { name: 'Terms of Service' });
    this.privacyPolicyLink = main.getByRole('link', { name: 'Privacy Policy' });
    this.parentGuardianNotice = main.getByText('BuddyTime is for parents and guardians (18+).');
    this.duplicateEmailMessage = main.getByText('An account with this email already exists', {
      exact: true,
    });
  }

  /** Opens the sign-up page. */
  async goto(): Promise<void> {
    await this.page.goto(AppRoute.SignUp);
  }

  /**
   * Opens sign-up with a post-auth `next` path.
   * @param nextPath In-app path preserved on the Log in link, such as `/friends`.
   */
  async gotoWithNext(nextPath: string): Promise<void> {
    const next = encodeURIComponent(nextPath);
    await this.page.goto(`${AppRoute.SignUp}?next=${next}`);
  }

  /** Opens the log-in page from the sign-up screen. */
  async openLogIn(): Promise<void> {
    await this.logInLink.click();
  }

  /** Clicks Sign up without entering a name, email, or password. */
  async submitEmpty(): Promise<void> {
    await this.signUpButton.click();
  }

  /**
   * Fills the create-account form and clicks Sign up.
   * @param name Value for Your name.
   * @param email Value for Email.
   * @param password Value for Password (8+ characters).
   */
  async submit(name: string, email: string, password: string): Promise<void> {
    await this.yourNameInput.fill(name);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.signUpButton.click();
  }

  /**
   * Fills Your name without submitting the form.
   * @param name Value for Your name.
   */
  async fillYourName(name: string): Promise<void> {
    await this.yourNameInput.fill(name);
  }

  /**
   * Types into Your name one character at a time so the browser enforces maxlength.
   * @param name Characters to type into Your name.
   */
  async typeYourName(name: string): Promise<void> {
    await this.yourNameInput.click();
    await this.yourNameInput.pressSequentially(name);
  }
}
