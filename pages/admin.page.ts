import type { Locator, Page } from '@playwright/test';

import { AppRoute } from '../test-data/routes';
import { HeaderComponent } from './components/header.component';

/** Internal admin metrics dashboard. */
export class AdminPage {
  readonly header: HeaderComponent;
  readonly refreshButton: Locator;
  readonly latestSignUpsTable: Locator;

  constructor(private readonly page: Page) {
    this.header = new HeaderComponent(page);
    this.refreshButton = page.getByRole('button', { name: 'Refresh' });
    this.latestSignUpsTable = page.getByRole('table');
  }

  /** Opens Admin. */
  async goto(): Promise<void> {
    await this.page.goto(AppRoute.Admin);
  }

  /** Reloads admin statistics. */
  async refresh(): Promise<void> {
    await this.refreshButton.click();
  }
}
