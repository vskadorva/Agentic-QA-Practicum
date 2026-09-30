import type { Locator, Page } from '@playwright/test';

/** Inline “add a child” form on Dashboard (and similar family editors). */
export class AddChildFormComponent {
  readonly firstNameInput: Locator;
  readonly birthYearInput: Locator;
  readonly birthMonthInput: Locator;
  readonly interestsInput: Locator;
  readonly genderCombobox: Locator;
  readonly addChildButton: Locator;

  constructor(page: Page) {
    const form = page.getByRole('textbox', { name: "Child's first name" }).locator('..');
    this.firstNameInput = page.getByLabel("Child's first name");
    this.birthYearInput = page.getByRole('spinbutton', { name: 'Birth year' });
    this.birthMonthInput = page.getByRole('spinbutton', { name: 'Month' });
    this.interestsInput = page.getByLabel('Interests (comma-separated)');
    this.genderCombobox = page.getByRole('combobox', { name: 'Gender' });
    this.addChildButton = form.getByRole('button', { name: 'Add child' });
  }

  /** Adds a quick interest chip from the suggested list. */
  async addInterestChip(label: string): Promise<void> {
    await this.addChildButton
      .locator('..')
      .getByRole('button', { name: label, exact: true })
      .click();
  }

  /** Submits the new-child form. */
  async submit(): Promise<void> {
    await this.addChildButton.click();
  }
}
