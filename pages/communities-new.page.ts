import type { Locator, Page } from '@playwright/test';

import { AppRoute } from '../test-data/routes';
import { CreateCommunityFormComponent } from './components/create-community-form.component';
import { HeaderComponent } from './components/header.component';

/** Create community form (`/communities/new`). */
export class CommunitiesNewPage {
  readonly header: HeaderComponent;
  readonly createCommunityForm: CreateCommunityFormComponent;
  readonly backLink: Locator;

  constructor(private readonly page: Page) {
    this.header = new HeaderComponent(page);
    this.createCommunityForm = new CreateCommunityFormComponent(page);
    this.backLink = page.getByRole('link', { name: '← Back to communities' });
  }

  /** Opens the create-community form. */
  async goto(): Promise<void> {
    await this.page.goto(AppRoute.CommunitiesNew);
  }
}
