import type { Locator, Page } from '@playwright/test';

/** Inline panel showing a shareable circle or co-parent invite link. */
export class InviteLinkPanelComponent {
  readonly panel: Locator;
  readonly inviteLink: Locator;
  readonly copyButton: Locator;

  constructor(page: Page) {
    this.panel = page.locator('main').filter({ hasText: 'invite:' });
    this.inviteLink = this.panel.getByRole('code');
    this.copyButton = this.panel.getByRole('button', { name: 'copy' });
  }

  /** Copies the displayed invite link to the clipboard. */
  async copyLink(): Promise<void> {
    await this.copyButton.click();
  }
}
