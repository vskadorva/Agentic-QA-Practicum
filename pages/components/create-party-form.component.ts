import type { Locator, Page, Response } from '@playwright/test';

/** “Create a birthday party” form on Birthdays. */
export class CreatePartyFormComponent {
  readonly birthdayChildCombobox: Locator;
  readonly inviteChildrenGroup: Locator;
  readonly inviteHelperText: Locator;
  readonly yourCircleInvites: Locator;
  readonly mapleClassInvites: Locator;
  readonly partyTitleInput: Locator;
  /** Required date/time control. It has no accessible name on the create form. */
  readonly dateTimeInput: Locator;
  readonly venueInput: Locator;
  readonly detailsInput: Locator;
  readonly invitationCardGroup: Locator;
  readonly createPartyButton: Locator;

  constructor(private readonly page: Page) {
    const section = page.getByText('Create a birthday party', { exact: true }).locator('..').locator('..');
    this.birthdayChildCombobox = section.getByRole('combobox').first();
    this.inviteChildrenGroup = section.getByRole('group', { name: 'Invite children' });
    this.inviteHelperText = this.inviteChildrenGroup.getByText(
      'Their parents get an email with the RSVP link.',
      { exact: true },
    );
    this.yourCircleInvites = section.getByText('Your circle', { exact: true }).locator('..');
    this.mapleClassInvites = section.getByText('Maple Class', { exact: true }).locator('..');
    this.partyTitleInput = section.getByRole('textbox', { name: 'Party title' });
    this.dateTimeInput = section.getByRole('textbox').nth(1);
    this.venueInput = section.getByRole('textbox', {
      name: 'Venue (e.g. our backyard, Chuck E. Cheese…)',
    });
    this.detailsInput = section.getByRole('textbox', { name: 'Details for guests (optional)' });
    this.invitationCardGroup = section.getByRole('radiogroup', { name: 'Invitation card' });
    this.createPartyButton = section.getByRole('button', { name: 'Create party' });
  }

  /**
   * Invitee checkbox under Invite children.
   * @param name — accessible name, e.g. Ethan The Nguyens
   */
  inviteeCheckbox(name: string): Locator {
    return this.inviteChildrenGroup.getByRole('checkbox', { name, exact: true });
  }

  /**
   * Invitation card radio inside the Invitation card group.
   * @param name — card label, e.g. Dinosaur
   */
  invitationCard(name: string): Locator {
    return this.invitationCardGroup.getByRole('radio', { name, exact: true });
  }

  /**
   * Selects whose birthday the party is for.
   * @param name — option label, e.g. Mia
   */
  async selectBirthdayChild(name: string): Promise<void> {
    await this.birthdayChildCombobox.selectOption({ label: name });
  }

  /**
   * Checks one invitee.
   * @param name — accessible name of the child checkbox
   */
  async toggleInvitee(name: string): Promise<void> {
    await this.inviteeCheckbox(name).check();
  }

  /**
   * Fills Party title.
   * @param title — party title shown on the invitation
   */
  async fillTitle(title: string): Promise<void> {
    await this.partyTitleInput.fill(title);
  }

  /**
   * Fills the required date/time control (`datetime-local` value).
   * @param value — local `YYYY-MM-DDTHH:mm`
   */
  async fillDateTime(value: string): Promise<void> {
    await this.dateTimeInput.fill(value);
  }

  /**
   * Selects an invitation card style.
   * @param name — radio label, e.g. Dinosaur
   */
  async selectInvitationCard(name: string): Promise<void> {
    await this.invitationCard(name).click();
  }

  /** Clicks Create party without waiting for a created event. */
  async submit(): Promise<void> {
    await this.createPartyButton.click();
  }

  /**
   * Clicks Create party and returns the id from `POST /api/v1/events`.
   * @returns created birthday event id
   */
  async submitAndReadId(): Promise<string> {
    const responsePromise = this.page.waitForResponse(isCreateEventResponse);
    await this.createPartyButton.click();
    const body: unknown = await (await responsePromise).json();
    return readEventId(body);
  }
}

function isCreateEventResponse(response: Response): boolean {
  if (response.request().method() !== 'POST' || response.status() !== 201) return false;
  try {
    return new URL(response.url()).pathname === '/api/v1/events';
  } catch {
    return false;
  }
}

function readEventId(body: unknown): string {
  if (typeof body === 'object' && body !== null && 'id' in body) {
    const id = (body as { id: unknown }).id;
    if (typeof id === 'string' && id.length > 0) return id;
  }
  throw new Error('Create party response did not include an id.');
}
