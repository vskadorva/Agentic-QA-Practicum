import { AvailabilityPage } from '../pages/availability.page';
import { test, expect } from '../fixtures/cleanup.fixture';
import { AppRoute } from '../test-data/routes';

/** No availability delete in api-client yet — @regression tests leave weekend slots saved for Family A. */

const availabilityUrlPattern = new RegExp(`${AppRoute.Availability}(\\?.*)?$`);

/** At least one weekend day shows non-empty slot times (AC1 "Sat and/or Sun"). */
async function expectWeekendSlotTimesPersisted(availability: AvailabilityPage): Promise<void> {
  const saturday = await availability.getDaySlotTimes('Sat');
  const sunday = await availability.getDaySlotTimes('Sun');
  const saturdayHasTimes = saturday.start.length > 0 && saturday.end.length > 0;
  const sundayHasTimes = sunday.start.length > 0 && sunday.end.length > 0;
  expect(saturdayHasTimes || sundayHasTimes).toBeTruthy();
}

test.describe('AQPBT-8 Availability — weekend preset and one-off validation', () => {
  test(
    'weekend afternoons preset persists after save and reload (AC1)',
    { tag: '@regression' },
    async ({ page }) => {
      const availability = new AvailabilityPage(page);

      await availability.goto();
      await expect(page).toHaveURL(availabilityUrlPattern);
      await expect(availability.availabilityBanner).toBeVisible();
      await expect(availability.weeklyFreeTimeHeading).toBeVisible();

      await availability.applyWeekendAfternoonsPreset();
      await availability.save();

      await expect(page).toHaveURL(availabilityUrlPattern);

      await page.reload();
      await expect(availability.weeklyFreeTimeHeading).toBeVisible();
      await expectWeekendSlotTimesPersisted(availability);
    },
  );

  test(
    'add exception with empty date does not create a row (AC2)',
    { tag: '@sanity' },
    async ({ page }) => {
      const availability = new AvailabilityPage(page);

      await availability.goto();
      await availability.scrollToOneOffChanges();

      const beforeCount = await availability.getExceptionRowCount();

      await availability.submitEmptyDateException();

      await expect.poll(() => availability.getExceptionRowCount()).toBe(beforeCount);
    },
  );

  test(
    'preset can be applied twice before save without leaving the page (E1)',
    { tag: '@regression' },
    async ({ page }) => {
      const availability = new AvailabilityPage(page);

      await availability.goto();
      await availability.applyWeekendAfternoonsPreset();
      await availability.applyWeekendAfternoonsPreset();
      await availability.save();

      await expect(page).toHaveURL(availabilityUrlPattern);

      await page.reload();
      await expectWeekendSlotTimesPersisted(availability);
    },
  );

  test(
    'one-off section visible alongside weekly editor heading (E2)',
    { tag: '@sanity' },
    async ({ page }) => {
      const availability = new AvailabilityPage(page);

      await availability.goto();
      await availability.scrollToOneOffChanges();

      await expect(availability.weeklyFreeTimeHeading).toBeVisible();
      await expect(availability.addExceptionButton).toBeVisible();
    },
  );

  // N1 skipped: Family A baseline weekend slots vary in shared env; no snapshot API yet.
});
