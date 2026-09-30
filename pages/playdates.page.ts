import type { Locator, Page } from '@playwright/test';

import { AppRoute } from '../test-data/routes';
import { HeaderComponent } from './components/header.component';
import { ProposePlaydateFormComponent } from './components/propose-playdate-form.component';

/** Playdate matching, requests, and history. */
export class PlaydatesPage {
  readonly header: HeaderComponent;
  readonly proposeForm: ProposePlaydateFormComponent;
  readonly findPlaydateHeading: Locator;

  constructor(private readonly page: Page) {
    this.header = new HeaderComponent(page);
    this.proposeForm = new ProposePlaydateFormComponent(page);
    this.findPlaydateHeading = page.getByRole('heading', { name: 'Find a playdate', level: 2 });
  }

  /** Opens Playdates. */
  async goto(): Promise<void> {
    await this.page.goto(AppRoute.Playdates);
  }

  /** Accepts a pending request from a named family. */
  async acceptRequestFrom(familyName: string): Promise<void> {
    const row = this.page.getByText(familyName, { exact: true }).locator('..').locator('..');
    await row.getByRole('button', { name: 'Accept' }).click();
  }

  /** Declines a pending request from a named family. */
  async declineRequestFrom(familyName: string): Promise<void> {
    const row = this.page.getByText(familyName, { exact: true }).locator('..').locator('..');
    await row.getByRole('button', { name: 'Decline' }).click();
  }

  /** Cancels a playdate row for a named family. */
  async cancelRequestFrom(familyName: string): Promise<void> {
    const row = this.page.getByText(familyName, { exact: true }).locator('..').locator('..');
    await row.getByRole('button', { name: 'cancel' }).click();
  }
}
