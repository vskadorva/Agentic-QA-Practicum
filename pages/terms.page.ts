import type { Locator, Page } from '@playwright/test';

import { AppRoute } from '../test-data/routes';

/** Public terms of service page. */
export class TermsPage {
  readonly termsOfServiceHeading: Locator;

  constructor(private readonly page: Page) {
    this.termsOfServiceHeading = page.getByRole('heading', {
      name: 'Terms of Service',
      level: 1,
    });
  }

  /** Opens the terms of service. */
  async goto(): Promise<void> {
    await this.page.goto(AppRoute.Terms);
  }
}
