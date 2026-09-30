import type { Locator, Page } from '@playwright/test';

import { AppRoute } from '../test-data/routes';
import { HeaderComponent } from './components/header.component';

/** Communities list. */
export class CommunitiesPage {
  readonly header: HeaderComponent;
  readonly createGroupLink: Locator;
  readonly yourCommunitiesHeading: Locator;

  constructor(private readonly page: Page) {
    this.header = new HeaderComponent(page);
    this.createGroupLink = page.getByRole('link', { name: '+ Create group' });
    this.yourCommunitiesHeading = page.getByRole('heading', { name: 'Your communities', level: 2 });
  }

  /** Opens Communities. */
  async goto(): Promise<void> {
    await this.page.goto(AppRoute.Communities);
  }

  /** Opens a community from the list by its display name. */
  async openCommunity(name: string): Promise<void> {
    await this.page.getByRole('link', { name: new RegExp(name) }).click();
  }
}
