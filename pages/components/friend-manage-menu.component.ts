import type { Locator, Page } from '@playwright/test';

/** Expanded manage actions for a connected family on Friends. */
export class FriendManageMenuComponent {
  readonly reportButton: Locator;
  readonly blockButton: Locator;
  readonly removeButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page, familyName: string) {
    const card = page.locator('main').getByText(familyName, { exact: true }).locator('..').locator('..');
    this.reportButton = card.getByRole('button', { name: 'report' });
    this.blockButton = card.getByRole('button', { name: 'block' });
    this.removeButton = card.getByRole('button', { name: 'remove' });
    this.cancelButton = card.getByRole('button', { name: 'cancel' });
  }

  /** Closes the manage menu without changing the connection. */
  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }
}
