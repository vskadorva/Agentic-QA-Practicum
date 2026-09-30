import type { Locator, Page } from '@playwright/test';

import { AppRoute } from '../test-data/routes';
import { DeleteAccountFormComponent } from './components/delete-account-form.component';
import { HeaderComponent } from './components/header.component';

/** My Profile — account, family, and settings. */
export class ProfilePage {
  readonly header: HeaderComponent;
  readonly deleteAccountForm: DeleteAccountFormComponent;
  readonly displayNameInput: Locator;
  readonly phoneInput: Locator;
  readonly saveMyDetailsButton: Locator;
  readonly familyNameInput: Locator;
  readonly hostAddressInput: Locator;
  readonly saveFamilyDetailsButton: Locator;
  readonly privacySafetyButton: Locator;
  readonly notificationsSettingsButton: Locator;
  readonly calendarSyncButton: Locator;
  readonly myAvailabilityButton: Locator;
  readonly deleteAccountButton: Locator;
  readonly profileLogOutButton: Locator;

  constructor(private readonly page: Page) {
    this.header = new HeaderComponent(page);
    this.deleteAccountForm = new DeleteAccountFormComponent(page);
    this.displayNameInput = page.getByLabel('Display name (how your circle sees you)');
    this.phoneInput = page.getByLabel('Phone (optional)');
    this.saveMyDetailsButton = page.getByRole('button', { name: 'Save my details' });
    this.familyNameInput = page.getByLabel('Family name');
    this.hostAddressInput = page.getByLabel('Host address or meeting note');
    this.saveFamilyDetailsButton = page.getByRole('button', { name: 'Save family details' });
    this.privacySafetyButton = page.getByRole('button', { name: /Privacy & Safety/i });
    this.notificationsSettingsButton = page.getByRole('button', { name: /^Notifications Push/i });
    this.calendarSyncButton = page.getByRole('button', { name: /Calendar Sync/i });
    this.myAvailabilityButton = page.getByRole('button', { name: /My Availability/i });
    this.deleteAccountButton = page.getByRole('button', { name: 'Delete account…' });
    this.profileLogOutButton = page
      .locator('main')
      .getByRole('button', { name: 'Log out', exact: true });
  }

  /** Opens My Profile. */
  async goto(): Promise<void> {
    await this.page.goto(AppRoute.Profile);
  }

  /** Expands the delete-account confirmation form. */
  async openDeleteAccount(): Promise<void> {
    await this.deleteAccountButton.click();
  }

  /** Opens Privacy & Safety (status feedback in private mode). */
  async openPrivacySafety(): Promise<void> {
    await this.privacySafetyButton.click();
  }

  /** Opens notification preferences. */
  async openNotificationSettings(): Promise<void> {
    await this.notificationsSettingsButton.click();
  }
}
