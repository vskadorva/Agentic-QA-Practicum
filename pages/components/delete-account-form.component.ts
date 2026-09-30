import type { Locator, Page } from '@playwright/test';

/** Password confirmation step before permanent account deletion on Profile. */
export class DeleteAccountFormComponent {
  readonly root: Locator;
  readonly passwordInput: Locator;
  readonly deleteForeverButton: Locator;
  readonly keepAccountButton: Locator;

  constructor(page: Page) {
    this.root = page
      .getByText('Confirm with your password to permanently delete everything.')
      .locator('..');
    this.passwordInput = this.root.getByRole('textbox', { name: 'Your password' });
    this.deleteForeverButton = this.root.getByRole('button', { name: 'Delete forever' });
    this.keepAccountButton = this.root.getByRole('button', { name: 'Keep my account' });
  }

  /** Dismisses the delete-account confirmation. */
  async keepAccount(): Promise<void> {
    await this.keepAccountButton.click();
  }

  /**
   * @param password Account password (from env in tests).
   */
  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }
}
