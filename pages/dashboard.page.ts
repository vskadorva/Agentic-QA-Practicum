import type { Locator, Page } from '@playwright/test';

import { AppRoute } from '../test-data/routes';
import { AddChildFormComponent } from './components/add-child-form.component';
import { AvatarPickerComponent } from './components/avatar-picker.component';
import { HeaderComponent } from './components/header.component';
import { InviteLinkPanelComponent } from './components/invite-link-panel.component';
import {
  ADD_CHILD_INTEREST_CHIP_LABELS,
  DASHBOARD_AVATAR_ICON_NAMES,
} from './dashboard.constants';

export { ADD_CHILD_INTEREST_CHIP_LABELS, DASHBOARD_AVATAR_ICON_NAMES };

/** Signed-in home / Dashboard (`/app`). */
export class DashboardPage {
  readonly header: HeaderComponent;
  readonly addChildForm: AddChildFormComponent;
  readonly inviteLinkPanel: InviteLinkPanelComponent;
  readonly greetingHeading: Locator;
  readonly findPlaydateLink: Locator;
  readonly inviteFamilyButton: Locator;
  readonly inviteCoParentButton: Locator;
  readonly enablePushRemindersButton: Locator;
  readonly dashboardBanner: Locator;

  constructor(private readonly page: Page) {
    this.header = new HeaderComponent(page);
    this.dashboardBanner = page.getByRole('banner').filter({ hasText: 'Dashboard' });
    this.addChildForm = new AddChildFormComponent(page);
    this.inviteLinkPanel = new InviteLinkPanelComponent(page);
    this.greetingHeading = page.getByRole('heading', { level: 2 });
    this.findPlaydateLink = page.getByRole('link', { name: 'Find a Playdate' });
    this.inviteFamilyButton = page.getByRole('button', { name: '+ Invite a family' });
    this.inviteCoParentButton = page.getByRole('button', { name: 'Invite co-parent' });
    this.enablePushRemindersButton = page.getByRole('button', { name: 'Enable push reminders' });
  }

  /** Opens Dashboard. */
  async goto(): Promise<void> {
    await this.page.goto(AppRoute.Dashboard);
  }

  /** Family card header area containing the family name and parent display name. */
  familyBlock(familyName: string): Locator {
    return this.page.getByText(familyName, { exact: true }).locator('..').locator('..');
  }

  /** Family name label in the family block. */
  familyNameLocator(familyName: string): Locator {
    return this.familyBlock(familyName).getByText(familyName, { exact: true });
  }

  /** Parent display name shown under the family name. */
  parentDisplayNameLocator(familyName: string, displayName: string): Locator {
    return this.familyBlock(familyName).getByText(displayName, { exact: true });
  }

  /** Numeric stat paired with the “My Kids” label. */
  myKidsCountLocator(): Locator {
    return this.page.getByText('My Kids', { exact: true }).locator('..').getByText(/^\d+$/, { exact: true });
  }

  /** Reads the My Kids stat as a number. */
  async getMyKidsCount(): Promise<number> {
    const text = await this.myKidsCountLocator().innerText();
    return Number.parseInt(text, 10);
  }

  /** Count of child rows (remove buttons) in the family block. */
  async getChildRowCount(familyName: string): Promise<number> {
    return this.familyBlock(familyName).getByRole('button', { name: 'remove' }).count();
  }

  /** One child row in the family block, located by summary line text. */
  childRowBySummary(familyName: string, summaryLine: string): Locator {
    return this.familyBlock(familyName)
      .getByRole('button', { name: 'remove' })
      .locator('..')
      .filter({ hasText: summaryLine });
  }

  /** Summary line text for a child row (e.g. `Mia, 7 · Girl`). */
  childSummaryLocator(familyName: string, summaryLine: string): Locator {
    return this.childRowBySummary(familyName, summaryLine).getByText(summaryLine, { exact: true });
  }

  /** Interest tag elements for a child row. */
  childInterestTags(familyName: string, summaryLine: string): Locator {
    const summary = this.childRowBySummary(familyName, summaryLine).getByText(summaryLine, { exact: true });
    return summary.locator('..').locator('> *').filter({ hasNotText: summaryLine });
  }

  /** Opens avatar editing for a child on the family card. */
  async openAvatarPickerForChild(familyName: string, summaryLine: string): Promise<AvatarPickerComponent> {
    const row = this.childRowBySummary(familyName, summaryLine);
    await row.getByRole('button', { name: 'Change avatar' }).click();
    return new AvatarPickerComponent(this.page);
  }

  /** Removes a child row via its remove control. */
  async removeChild(familyName: string, summaryLine: string): Promise<void> {
    await this.childRowBySummary(familyName, summaryLine).getByRole('button', { name: 'remove' }).click();
  }

  /** Avatar icon button in the add-child form (scoped away from open editors). */
  addChildAvatarIconButton(iconName: string): Locator {
    return this.addChildForm.formRoot.getByRole('button', { name: iconName, exact: true });
  }

  /** Interest shortcut chip in the add-child form. */
  addChildInterestChip(label: string): Locator {
    return this.addChildForm.formRoot.getByRole('button', { name: label, exact: true });
  }

  /** Expands the circle invite link panel. */
  async openInviteFamily(): Promise<void> {
    await this.inviteFamilyButton.click();
  }

  /** Expands the co-parent invite link panel. */
  async openInviteCoParent(): Promise<void> {
    await this.inviteCoParentButton.click();
  }
}
