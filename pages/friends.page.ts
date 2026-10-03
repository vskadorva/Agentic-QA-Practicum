import type { Locator, Page } from '@playwright/test';

import { AppRoute } from '../test-data/routes';
import { FriendManageMenuComponent } from './components/friend-manage-menu.component';
import { HeaderComponent } from './components/header.component';
import { InviteLinkPanelComponent } from './components/invite-link-panel.component';

/** Trusted circle / friends list. */
export class FriendsPage {
  readonly header: HeaderComponent;
  readonly inviteLinkPanel: InviteLinkPanelComponent;
  readonly inviteFamilyButton: Locator;
  readonly exploreCommunitiesLink: Locator;
  readonly friendsBanner: Locator;

  constructor(private readonly page: Page) {
    this.header = new HeaderComponent(page);
    this.friendsBanner = page.getByRole('banner').filter({ hasText: 'Friends' });
    this.inviteLinkPanel = new InviteLinkPanelComponent(page);
    this.inviteFamilyButton = page.getByRole('button', { name: '+ Invite a family' });
    this.exploreCommunitiesLink = page.getByRole('link', { name: 'Explore Communities' });
  }

  /** Opens Friends. */
  async goto(): Promise<void> {
    await this.page.goto(AppRoute.Friends);
  }

  /** Expands the circle invite link panel. */
  async openInviteFamily(): Promise<void> {
    await this.inviteFamilyButton.click();
  }

  /** Opens manage actions for a connected family card. */
  async openManageForFamily(familyName: string): Promise<FriendManageMenuComponent> {
    const card = this.page.getByText(familyName, { exact: true }).locator('..').locator('..');
    await card.getByRole('button', { name: 'manage' }).click();
    return new FriendManageMenuComponent(this.page, familyName);
  }

  /** Schedules a playdate from a friend card. */
  async schedulePlaydateForFamily(familyName: string): Promise<void> {
    const card = this.page.getByText(familyName, { exact: true }).locator('..').locator('..');
    await card.getByRole('button', { name: 'Schedule Playdate' }).click();
  }
}
