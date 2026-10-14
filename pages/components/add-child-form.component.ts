import type { Locator, Page } from '@playwright/test';

/** Inline “add a child” form on Dashboard (and similar family editors). */
export class AddChildFormComponent {
  readonly formRoot: Locator;
  readonly firstNameInput: Locator;
  readonly birthYearInput: Locator;
  readonly birthMonthInput: Locator;
  readonly interestsInput: Locator;
  readonly genderCombobox: Locator;
  readonly addChildButton: Locator;

  constructor(page: Page) {
    this.formRoot = page.getByRole('textbox', { name: "Child's first name" }).locator('..');
    this.firstNameInput = page.getByRole('textbox', { name: "Child's first name" });
    this.birthYearInput = page.getByRole('spinbutton', { name: 'Birth year' });
    this.birthMonthInput = page.getByRole('spinbutton', { name: 'Month' });
    this.interestsInput = page.getByRole('textbox', { name: 'Interests (comma-separated)' });
    this.genderCombobox = page.getByRole('combobox', { name: 'Gender' });
    this.addChildButton = this.formRoot.getByRole('button', { name: 'Add child' });
  }

  /** Adds a quick interest chip from the suggested list. */
  async addInterestChip(label: string): Promise<void> {
    await this.formRoot.getByRole('button', { name: label, exact: true }).click();
  }

  /** Submits the new-child form. */
  async submit(): Promise<void> {
    await this.addChildButton.click();
  }
}
