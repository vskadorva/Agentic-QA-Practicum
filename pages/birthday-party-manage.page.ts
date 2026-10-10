import type { Locator, Page } from '@playwright/test';

import { AppRoute } from '../test-data/routes';
import { HeaderComponent } from './components/header.component';

/** Manage one birthday party at `/birthdays/{partyId}`. */
export class BirthdayPartyManagePage {
  readonly header: HeaderComponent;
  readonly birthdaysBanner: Locator;
  readonly editButton: Locator;
  readonly copyButton: Locator;
  readonly cancelPartyButton: Locator;
  readonly addToCalendarLink: Locator;
  readonly sendInvitesButton: Locator;
  readonly saveChangesButton: Locator;
  readonly discardButton: Locator;
  readonly guestLinkLabel: Locator;
  readonly inviteByEmail: Locator;
  readonly inviteEmailHelper: Locator;
  readonly emptyRsvpsMessage: Locator;
  readonly titleInput: Locator;
  readonly dateTimeInput: Locator;
  readonly venueInput: Locator;
  readonly detailsInput: Locator;

  constructor(private readonly page: Page) {
    this.header = new HeaderComponent(page);
    this.birthdaysBanner = page.getByRole('banner').filter({ hasText: 'Birthdays' });
    this.editButton = page.getByRole('button', { name: 'Edit', exact: true });
    this.copyButton = page.getByRole('button', { name: 'copy', exact: true });
    this.cancelPartyButton = page.getByRole('button', { name: 'Cancel party', exact: true });
    this.addToCalendarLink = page.getByRole('link', { name: 'Add to my calendar' });
    this.sendInvitesButton = page.getByRole('button', { name: 'Send invites', exact: true });
    this.saveChangesButton = page.getByRole('button', { name: 'Save changes', exact: true });
    this.discardButton = page.getByRole('button', { name: 'Discard', exact: true });
    this.guestLinkLabel = page.getByText('Guest link:', { exact: true });
    this.inviteByEmail = page.getByText('Invite by email', { exact: true });
    this.inviteEmailHelper = page.getByText(
      'Each guest gets the RSVP link and a calendar file — no app or account required.',
      { exact: true },
    );
    this.emptyRsvpsMessage = page.getByText('No responses yet — share the guest link!');
    this.titleInput = page.getByRole('textbox', { name: 'Title', exact: true });
    this.dateTimeInput = page.getByRole('textbox', { name: 'Date and time', exact: true });
    this.venueInput = page.getByRole('textbox', { name: 'Venue', exact: true });
    this.detailsInput = page.getByRole('textbox', { name: 'Details', exact: true });
  }

  /**
   * Opens the manage screen for one party.
   * @param partyId — birthday event id
   */
  async goto(partyId: string): Promise<void> {
    await this.page.goto(`${AppRoute.Birthdays}/${partyId}`);
  }

  /**
   * Party title shown on the manage screen.
   * @param title — title used when the party was created
   */
  partyTitle(title: string): Locator {
    return this.page.getByText(title, { exact: false });
  }

  /** Opens inline edit on the manage screen. */
  async edit(): Promise<void> {
    await this.editButton.click();
  }

  /** Leaves edit mode without saving. */
  async discard(): Promise<void> {
    await this.discardButton.click();
  }

  /** Clicks Cancel party. The spec handles the browser confirm. */
  async requestCancel(): Promise<void> {
    await this.cancelPartyButton.click();
  }
}
