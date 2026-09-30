import type { Locator, Page } from '@playwright/test';

/** “New announcement” composer on a community’s Announcements tab. */
export class PostAnnouncementFormComponent {
  readonly messageInput: Locator;
  readonly postButton: Locator;

  constructor(page: Page) {
    const section = page.getByText('New announcement', { exact: true }).locator('..');
    this.messageInput = section.getByRole('textbox', {
      name: 'Share an update with every family in the group…',
    });
    this.postButton = section.getByRole('button', { name: 'Post announcement' });
  }

  /** Posts the announcement to the group. */
  async submit(): Promise<void> {
    await this.postButton.click();
  }
}
