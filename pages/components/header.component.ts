import type { Locator, Page } from '@playwright/test';

/** Signed-in app shell: sidebar navigation and top banner shared by every authenticated page. */
export class HeaderComponent {
  readonly sidebar: Locator;
  readonly banner: Locator;
  readonly notificationsButton: Locator;
  readonly logOutButton: Locator;
  readonly goPremiumButton: Locator;
  readonly discoverButton: Locator;
  readonly dashboardLink: Locator;
  readonly calendarLink: Locator;
  readonly friendsLink: Locator;
  readonly communitiesLink: Locator;
  readonly availabilityLink: Locator;
  readonly playdatesLink: Locator;
  readonly birthdaysLink: Locator;
  readonly profileLink: Locator;
  readonly adminLink: Locator;

  constructor(private readonly page: Page) {
    this.sidebar = page.getByRole('complementary');
    this.banner = page.getByRole('banner');
    this.notificationsButton = this.banner.getByRole('button', { name: 'Notifications' });
    this.logOutButton = this.banner.getByRole('button', { name: 'Log out' });
    this.goPremiumButton = this.sidebar.getByRole('button', { name: /Go Premium/i });
    this.discoverButton = this.sidebar.getByRole('button', { name: 'Discover', exact: true });
    this.dashboardLink = this.sidebar.getByRole('link', { name: 'Dashboard' });
    this.calendarLink = this.sidebar.getByRole('link', { name: 'Calendar' });
    this.friendsLink = this.sidebar.getByRole('link', { name: 'Friends' });
    this.communitiesLink = this.sidebar.getByRole('link', { name: 'Communities', exact: true });
    this.availabilityLink = this.sidebar.getByRole('link', { name: 'Availability' });
    this.playdatesLink = this.sidebar.getByRole('link', { name: 'Playdates' });
    this.birthdaysLink = this.sidebar.getByRole('link', { name: 'Birthdays' });
    this.profileLink = this.sidebar.getByRole('link', { name: 'My Profile' });
    this.adminLink = this.sidebar.getByRole('link', { name: 'Admin' });
  }

  /** Opens the in-app notifications feed from the banner. */
  async openNotifications(): Promise<void> {
    await this.notificationsButton.click();
  }

  /** Signs out via the banner control. */
  async logOut(): Promise<void> {
    await this.logOutButton.click();
  }

  /** Triggers the Discover sidebar action (status toast when not yet available). */
  async openDiscover(): Promise<void> {
    await this.discoverButton.click();
  }

  /** Triggers the Go Premium upsell (status toast when not yet available). */
  async openGoPremium(): Promise<void> {
    await this.goPremiumButton.click();
  }

  /** Navigates to Dashboard via the sidebar. */
  async goToDashboard(): Promise<void> {
    await this.dashboardLink.click();
  }

  /** Navigates to Calendar via the sidebar. */
  async goToCalendar(): Promise<void> {
    await this.calendarLink.click();
  }

  /** Navigates to Friends via the sidebar. */
  async goToFriends(): Promise<void> {
    await this.friendsLink.click();
  }

  /** Navigates to Communities via the sidebar. */
  async goToCommunities(): Promise<void> {
    await this.communitiesLink.click();
  }

  /** Navigates to Availability via the sidebar. */
  async goToAvailability(): Promise<void> {
    await this.availabilityLink.click();
  }

  /** Navigates to Playdates via the sidebar. */
  async goToPlaydates(): Promise<void> {
    await this.playdatesLink.click();
  }

  /** Navigates to Birthdays via the sidebar. */
  async goToBirthdays(): Promise<void> {
    await this.birthdaysLink.click();
  }

  /** Navigates to My Profile via the sidebar. */
  async goToProfile(): Promise<void> {
    await this.profileLink.click();
  }

  /** Navigates to Admin via the sidebar. */
  async goToAdmin(): Promise<void> {
    await this.adminLink.click();
  }
}
