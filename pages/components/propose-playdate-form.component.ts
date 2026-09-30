import type { Locator, Page } from '@playwright/test';

/** “Propose” playdate request form on the Playdates page. */
export class ProposePlaydateFormComponent {
  readonly familyCombobox: Locator;
  readonly sendRequestButton: Locator;
  readonly locationNoteInput: Locator;
  readonly optionalNoteInput: Locator;

  constructor(page: Page) {
    const section = page.getByText('Propose', { exact: true }).locator('..').locator('..');
    this.familyCombobox = section.getByRole('combobox').first();
    this.locationNoteInput = section.getByRole('textbox', {
      name: 'Location note, park name, or address',
    });
    this.optionalNoteInput = section.getByRole('textbox', { name: 'Optional note' });
    this.sendRequestButton = section.getByRole('button', { name: 'Send request' });
  }

  /** Picks a suggested matched slot by its full accessible name. */
  async selectMatchedSlot(label: string): Promise<void> {
    await this.sendRequestButton
      .locator('..')
      .getByRole('button', { name: label })
      .click();
  }

  /** Sends the playdate request. */
  async submit(): Promise<void> {
    await this.sendRequestButton.click();
  }
}
