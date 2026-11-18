import type { Locator, Page } from '@playwright/test';

import { AppRoute } from '../test-data/routes';
import { HeaderComponent } from './components/header.component';

/** Communities list. */
export class CommunitiesPage {
  readonly header: HeaderComponent;
  readonly communitiesBanner: Locator;
  readonly createGroupLink: Locator;
  readonly yourCommunitiesHeading: Locator;
  readonly description: Locator;
  readonly emptyStateHeading: Locator;
  readonly createFirstGroupLink: Locator;

  constructor(private readonly page: Page) {
    this.header = new HeaderComponent(page);
    this.communitiesBanner = page.getByRole('banner').filter({ hasText: 'Communities' });
    this.createGroupLink = page.getByRole('link', { name: '+ Create group' });
    this.yourCommunitiesHeading = page.getByRole('heading', { name: 'Your communities', level: 2 });
    this.description = page.getByText(
      'Classes, daycares and neighbourhood groups your family belongs to.',
      { exact: true },
    );
    this.emptyStateHeading = page.getByRole('heading', {
      name: 'Create a group for a daycare, class or activity',
      level: 3,
    });
    this.createFirstGroupLink = page.getByRole('link', { name: 'Create your first group' });
  }

  /** Opens Communities. */
  async goto(): Promise<void> {
    await this.page.goto(AppRoute.Communities);
  }

  /**
   * Group card link for a community, scoped by its level-3 heading.
   * @param name - Community display name shown on the card.
   */
  groupCard(name: string): Locator {
    return this.page.getByRole('link').filter({
      has: this.page.getByRole('heading', { name, level: 3 }),
    });
  }

  /**
   * Opens a community from the list by clicking its group card.
   * @param name - Community display name on the card.
   */
  async openCommunity(name: string): Promise<void> {
    await this.groupCard(name).click();
  }
}
