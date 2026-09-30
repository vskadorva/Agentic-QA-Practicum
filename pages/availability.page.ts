import type { Locator, Page } from '@playwright/test';

import { AppRoute } from '../test-data/routes';
import { HeaderComponent } from './components/header.component';

/** Weekly availability editor. */
export class AvailabilityPage {
  readonly header: HeaderComponent;
  readonly weekendAfternoonsPreset: Locator;
  readonly addSlotButton: Locator;
  readonly saveAvailabilityButton: Locator;
  readonly addExceptionButton: Locator;

  constructor(private readonly page: Page) {
    this.header = new HeaderComponent(page);
    this.weekendAfternoonsPreset = page.getByRole('button', { name: 'Weekend afternoons' });
    this.addSlotButton = page.getByRole('button', { name: '+ Add slot' });
    this.saveAvailabilityButton = page.getByRole('button', { name: 'Save availability' });
    this.addExceptionButton = page.getByRole('button', { name: 'Add exception' });
  }

  /** Opens Availability. */
  async goto(): Promise<void> {
    await this.page.goto(AppRoute.Availability);
  }

  /** Applies the weekend-afternoons quick preset. */
  async applyWeekendAfternoonsPreset(): Promise<void> {
    await this.weekendAfternoonsPreset.click();
  }

  /** Persists weekly slot changes. */
  async save(): Promise<void> {
    await this.saveAvailabilityButton.click();
  }
}
