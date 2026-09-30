import type { Locator, Page } from '@playwright/test';

import { AppRoute } from '../test-data/routes';
import { CreatePartyFormComponent } from './components/create-party-form.component';
import { HeaderComponent } from './components/header.component';

/** Birthday party invitations. */
export class BirthdaysPage {
  readonly header: HeaderComponent;
  readonly createPartyForm: CreatePartyFormComponent;
  readonly emptyPartiesMessage: Locator;

  constructor(private readonly page: Page) {
    this.header = new HeaderComponent(page);
    this.createPartyForm = new CreatePartyFormComponent(page);
    this.emptyPartiesMessage = page.getByText(/No upcoming parties yet/);
  }

  /** Opens Birthdays. */
  async goto(): Promise<void> {
    await this.page.goto(AppRoute.Birthdays);
  }
}
