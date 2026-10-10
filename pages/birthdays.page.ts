import type { Locator, Page } from '@playwright/test';

import { AppRoute } from '../test-data/routes';
import { CreatePartyFormComponent } from './components/create-party-form.component';
import { HeaderComponent } from './components/header.component';

/** Birthday party invitations. */
export class BirthdaysPage {
  readonly header: HeaderComponent;
  readonly createPartyForm: CreatePartyFormComponent;
  readonly birthdaysBanner: Locator;
  readonly createPartyTitle: Locator;
  readonly emptyPartiesMessage: Locator;
  readonly partiesLoading: Locator;
  readonly createdStatus: Locator;

  constructor(private readonly page: Page) {
    this.header = new HeaderComponent(page);
    this.createPartyForm = new CreatePartyFormComponent(page);
    this.birthdaysBanner = page.getByRole('banner').filter({ hasText: 'Birthdays' });
    this.createPartyTitle = page.getByText('Create a birthday party', { exact: true });
    this.emptyPartiesMessage = page.getByText(/No upcoming parties yet/);
    this.partiesLoading = page.getByText('Loading…', { exact: true });
    this.createdStatus = page.getByRole('status').filter({ hasText: 'Party created' });
  }

  /** Opens Birthdays. */
  async goto(): Promise<void> {
    await this.page.goto(AppRoute.Birthdays);
  }

  /**
   * Upcoming party card that shows this title.
   * @param title — party title entered on the create form
   */
  upcomingPartyCard(title: string): Locator {
    return this.page
      .getByRole('link', { name: 'Manage →' })
      .locator('..')
      .locator('..')
      .filter({ hasText: title });
  }

  /**
   * Opens Manage → for the upcoming party with this title.
   * @param title — party title entered on the create form
   */
  async openManage(title: string): Promise<void> {
    await this.upcomingPartyCard(title).getByRole('link', { name: 'Manage →' }).click();
  }
}
