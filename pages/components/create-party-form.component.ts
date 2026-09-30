import type { Locator, Page } from '@playwright/test';

/** “Create a birthday party” form on Birthdays. */
export class CreatePartyFormComponent {
  readonly birthdayChildCombobox: Locator;
  readonly partyTitleInput: Locator;
  readonly venueInput: Locator;
  readonly detailsInput: Locator;
  readonly invitationCardGroup: Locator;
  readonly createPartyButton: Locator;

  constructor(page: Page) {
    const section = page.getByText('Create a birthday party', { exact: true }).locator('..');
    this.birthdayChildCombobox = section.getByRole('combobox').first();
    this.partyTitleInput = section.getByRole('textbox', { name: 'Party title' });
    this.venueInput = section.getByRole('textbox', {
      name: 'Venue (e.g. our backyard, Chuck E. Cheese…)',
    });
    this.detailsInput = section.getByRole('textbox', { name: 'Details for guests (optional)' });
    this.invitationCardGroup = section.getByRole('radiogroup', { name: 'Invitation card' });
    this.createPartyButton = section.getByRole('button', { name: 'Create party' });
  }

  /** Selects an invitation card style. */
  async selectInvitationCard(name: string): Promise<void> {
    await this.invitationCardGroup.getByRole('radio', { name, exact: true }).click();
  }

  /** Creates the birthday party (not used in read-only exploration). */
  async submit(): Promise<void> {
    await this.createPartyButton.click();
  }
}
