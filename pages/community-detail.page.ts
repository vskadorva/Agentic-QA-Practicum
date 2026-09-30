import type { Locator, Page } from '@playwright/test';

import { AppRoute } from '../test-data/routes';
import { CreateGroupEventFormComponent } from './components/create-group-event-form.component';
import { HeaderComponent } from './components/header.component';
import { PostAnnouncementFormComponent } from './components/post-announcement-form.component';

/** Single community hub (Maple Class during exploration). */
export class CommunityDetailPage {
  readonly header: HeaderComponent;
  readonly createGroupEventForm: CreateGroupEventFormComponent;
  readonly postAnnouncementForm: PostAnnouncementFormComponent;
  readonly communityHeading: Locator;
  readonly membersTab: Locator;
  readonly eventsTab: Locator;
  readonly announcementsTab: Locator;
  readonly inviteFamiliesButton: Locator;
  readonly copyInviteLinkButton: Locator;
  readonly allCommunitiesLink: Locator;

  constructor(private readonly page: Page) {
    this.header = new HeaderComponent(page);
    this.createGroupEventForm = new CreateGroupEventFormComponent(page);
    this.postAnnouncementForm = new PostAnnouncementFormComponent(page);
    this.communityHeading = page.getByRole('heading', { level: 2 });
    this.membersTab = page.getByRole('tab', { name: 'Members' });
    this.eventsTab = page.getByRole('tab', { name: 'Events' });
    this.announcementsTab = page.getByRole('tab', { name: 'Announcements' });
    this.inviteFamiliesButton = page.getByRole('button', { name: 'Invite families' });
    this.copyInviteLinkButton = page.getByRole('button', { name: 'Copy invite link' });
    this.allCommunitiesLink = page.getByRole('link', { name: '← All communities' });
  }

  /** Opens the explored Maple Class community. */
  async gotoMapleClass(): Promise<void> {
    await this.page.goto(AppRoute.CommunityMapleClass);
  }

  /** Switches to the Events tab. */
  async openEventsTab(): Promise<void> {
    await this.eventsTab.click();
  }

  /** Switches to the Announcements tab. */
  async openAnnouncementsTab(): Promise<void> {
    await this.announcementsTab.click();
  }

  /** Switches to the Members tab. */
  async openMembersTab(): Promise<void> {
    await this.membersTab.click();
  }
}
