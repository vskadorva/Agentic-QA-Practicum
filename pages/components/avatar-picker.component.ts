import type { Locator, Page } from '@playwright/test';

/** Expanded avatar and gender editor for an existing child row. */
export class AvatarPickerComponent {
  readonly root: Locator;
  readonly doneButton: Locator;
  readonly genderCombobox: Locator;

  /** Targets the open inline editor (call after **Change avatar**). */
  constructor(page: Page) {
    this.doneButton = page.getByRole('button', { name: 'done' });
    this.root = page
      .locator('div')
      .filter({ has: this.doneButton })
      .filter({ has: page.getByRole('button', { name: 'Fox', exact: true }) })
      .last();
    this.genderCombobox = this.root.getByRole('combobox');
  }

  /** Preset avatar icon button inside the expanded editor. */
  avatarIconButton(name: string): Locator {
    return this.root.getByRole('button', { name, exact: true });
  }

  /** Selects a preset avatar by its accessible name. */
  async selectAvatar(name: string): Promise<void> {
    await this.avatarIconButton(name).click();
  }

  /** Closes the picker (persists current selection). */
  async done(): Promise<void> {
    await this.doneButton.click();
  }
}
