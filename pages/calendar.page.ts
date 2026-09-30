import type { Locator, Page } from '@playwright/test';

import { AppRoute } from '../test-data/routes';
import { HeaderComponent } from './components/header.component';

/** Family calendar view. */
export class CalendarPage {
  readonly header: HeaderComponent;
  readonly monthLabel: Locator;
  readonly thisWeekSection: Locator;

  constructor(private readonly page: Page) {
    this.header = new HeaderComponent(page);
    this.monthLabel = page.getByText('Your family calendar').locator('..').getByText(/\w+ \d{4}/);
    this.thisWeekSection = page.getByText('This week', { exact: true });
  }

  /** Opens Calendar. */
  async goto(): Promise<void> {
    await this.page.goto(AppRoute.Calendar);
  }
}
