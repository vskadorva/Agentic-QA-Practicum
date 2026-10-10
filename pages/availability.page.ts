import type { Locator, Page } from '@playwright/test';

import { AppRoute } from '../test-data/routes';
import { HeaderComponent } from './components/header.component';

/** Short day labels shown in the weekly grid. */
export type WeeklyDayLabel = 'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat';

export type DaySlotTimes = {
  start: string;
  end: string;
};

/** Weekly availability editor. */
export class AvailabilityPage {
  readonly header: HeaderComponent;
  readonly availabilityBanner: Locator;
  readonly weeklyFreeTimeHeading: Locator;
  readonly oneOffChangesLabel: Locator;
  readonly oneOffChangesCard: Locator;
  readonly exceptionDateInput: Locator;
  readonly exceptionTypeCombobox: Locator;
  readonly weekendAfternoonsPreset: Locator;
  readonly addSlotButton: Locator;
  readonly saveAvailabilityButton: Locator;
  readonly addExceptionButton: Locator;

  constructor(private readonly page: Page) {
    this.header = new HeaderComponent(page);
    this.availabilityBanner = page.getByRole('banner').filter({ hasText: 'Availability' });
    this.weeklyFreeTimeHeading = page.getByRole('heading', {
      name: 'Set your weekly free time',
      level: 2,
    });
    this.oneOffChangesLabel = page.getByText('One-off changes', { exact: true });
    this.oneOffChangesCard = this.oneOffChangesLabel.locator('..').locator('..');
    this.exceptionDateInput = this.oneOffChangesCard.locator('form').getByRole('textbox').first();
    this.exceptionTypeCombobox = this.oneOffChangesCard.locator('form').getByRole('combobox');
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

  /** Scrolls the one-off changes block into view. */
  async scrollToOneOffChanges(): Promise<void> {
    await this.oneOffChangesLabel.scrollIntoViewIfNeeded();
  }

  /**
   * Locator for the weekly slot row whose Day combobox is set to {@link day}.
   * @param day — Sun–Sat label from the weekly grid
   */
  daySlotRow(day: WeeklyDayLabel): Locator {
    return this.page
      .getByRole('combobox', { name: 'Day' })
      .filter({ has: this.page.locator('option:checked', { hasText: day }) })
      .locator('..');
  }

  /**
   * Reads Start/End time values for a weekly day row.
   * @param day — Sun–Sat label from the weekly grid
   */
  async getDaySlotTimes(day: WeeklyDayLabel): Promise<DaySlotTimes> {
    const row = this.daySlotRow(day);
    const start = await row.getByRole('textbox', { name: 'Start time' }).inputValue();
    const end = await row.getByRole('textbox', { name: 'End time' }).inputValue();
    return { start, end };
  }

  /** Count of persisted exception rows in the one-off list. */
  async getExceptionRowCount(): Promise<number> {
    return this.oneOffChangesCard.getByRole('button', { name: 'remove' }).count();
  }

  /** Submits the one-off form with an empty date (Away / closed remains selected). */
  async submitEmptyDateException(): Promise<void> {
    await this.scrollToOneOffChanges();
    await this.exceptionDateInput.fill('');
    await this.addExceptionButton.click();
  }
}
