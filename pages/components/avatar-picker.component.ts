import type { Locator, Page } from '@playwright/test';

/** Expanded avatar and gender editor for an existing child row. */
export class AvatarPickerComponent {
  readonly root: Locator;
  readonly doneButton: Locator;
  readonly genderCombobox: Locator;

  constructor(page: Page, childSummary: string) {
    this.root = page.getByText(childSummary).locator('..').locator('..');
    this.doneButton = this.root.getByRole('button', { name: 'done' });
    this.genderCombobox = this.root.getByRole('combobox');
  }

  /** Selects a preset avatar by its accessible name. */
  async selectAvatar(name: string): Promise<void> {
    await this.root.getByRole('button', { name, exact: true }).click();
  }

  /** Closes the picker (persists current selection). */
  async done(): Promise<void> {
    await this.doneButton.click();
  }
}
