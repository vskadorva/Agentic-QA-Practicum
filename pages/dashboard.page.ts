import type { Locator, Page } from '@playwright/test';

import { AppRoute } from '../test-data/routes';
import { AddChildFormComponent } from './components/add-child-form.component';
import { AvatarPickerComponent } from './components/avatar-picker.component';
import { HeaderComponent } from './components/header.component';
import { InviteLinkPanelComponent } from './components/invite-link-panel.component';

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

  constructor(private readonly page: Page) {
    this.header = new HeaderComponent(page);
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

  /** Expands the circle invite link panel. */
  async openInviteFamily(): Promise<void> {
    await this.inviteFamilyButton.click();
  }

  /** Expands the co-parent invite link panel. */
  async openInviteCoParent(): Promise<void> {
    await this.inviteCoParentButton.click();
  }

  /** Opens avatar editing for a child on the family card. */
  async openAvatarPickerForChild(childSummary: string): Promise<AvatarPickerComponent> {
    await this.page.getByText(childSummary).locator('..').getByRole('button', { name: 'Change avatar' }).click();
    return new AvatarPickerComponent(this.page, childSummary);
  }
}
