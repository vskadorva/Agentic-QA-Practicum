import type { Locator, Page } from '@playwright/test';

import { AppRoute } from '../test-data/routes';

/** Public privacy policy page. */
export class PrivacyPage {
  readonly privacyPolicyHeading: Locator;

  constructor(private readonly page: Page) {
    this.privacyPolicyHeading = page.getByRole('heading', {
      name: 'Privacy Policy',
      level: 1,
    });
  }

  /** Opens the privacy policy. */
  async goto(): Promise<void> {
    await this.page.goto(AppRoute.Privacy);
  }
}
