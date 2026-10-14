import type { Locator, Page } from '@playwright/test';

/** Expanded avatar and gender editor for an existing child row. */
export class AvatarPickerComponent {
  readonly root: Locator;
  readonly doneButton: Locator;
  readonly genderCombobox: Locator;

  constructor(_page: Page, row: Locator) {
    this.root = row;
    this.doneButton = this.root.getByRole('button', { name: 'done' });
    this.genderCombobox = this.root.getByRole('combobox');
  }

  /** Preset avatar icon button inside the expanded editor. */
  avatarIconButton(name: string): Locator {
    return this.root.getByRole('button', { name, exact: true });
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
