import type { Locator, Page } from '@playwright/test';

/** “Create a group event” form on a community’s Events tab. */
export class CreateGroupEventFormComponent {
  readonly eventTitleInput: Locator;
  readonly venueInput: Locator;
  readonly detailsInput: Locator;
  readonly invitationCardGroup: Locator;
  readonly createEventButton: Locator;

  constructor(page: Page) {
    const section = page.getByText('Create a group event', { exact: true }).locator('..');
    this.eventTitleInput = section.getByRole('textbox', { name: 'Event title' });
    this.venueInput = section.getByRole('textbox', { name: 'Venue (optional)' });
    this.detailsInput = section.getByRole('textbox', {
      name: 'Details for families (optional)',
    });
    this.invitationCardGroup = section.getByRole('radiogroup', { name: 'Invitation card' });
    this.createEventButton = section.getByRole('button', { name: 'Create event' });
  }

  /** Submits the group event form. */
  async submit(): Promise<void> {
    await this.createEventButton.click();
  }
}
