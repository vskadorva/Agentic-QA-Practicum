import type { Locator, Page } from '@playwright/test';

/** Create-community form at /communities/new. */
export class CreateCommunityFormComponent {
  readonly groupNameInput: Locator;
  readonly typeCombobox: Locator;
  readonly descriptionInput: Locator;
  readonly createGroupButton: Locator;
  readonly cancelLink: Locator;

  constructor(page: Page) {
    const form = page.getByRole('heading', { name: 'Create a community' }).locator('..').locator('..');
    this.groupNameInput = page.getByLabel('Group name');
    this.typeCombobox = page.getByRole('combobox', { name: 'Type' });
    this.descriptionInput = page.getByLabel('Description (optional)');
    this.createGroupButton = form.getByRole('button', { name: 'Create group' });
    this.cancelLink = form.getByRole('link', { name: 'Cancel' });
  }

  /** Returns to the communities list without creating a group. */
  async cancel(): Promise<void> {
    await this.cancelLink.click();
  }

  /** Submits the new community form. */
  async submit(): Promise<void> {
    await this.createGroupButton.click();
  }
}
