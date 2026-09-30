import type { Locator, Page } from '@playwright/test';

import { AppRoute } from '../test-data/routes';
import { HeaderComponent } from './components/header.component';

/** Find-a-playdate entry when the circle gate applies (`/playdates/new`). */
export class PlaydatesNewPage {
  readonly header: HeaderComponent;
  readonly emptyStateMessage: Locator;

  constructor(private readonly page: Page) {
    this.header = new HeaderComponent(page);
    this.emptyStateMessage = page.getByText(/Invite a trusted family first/);
  }

  /** Opens Find a Playdate (`/playdates/new`). */
  async goto(): Promise<void> {
    await this.page.goto(AppRoute.PlaydatesNew);
  }
}
