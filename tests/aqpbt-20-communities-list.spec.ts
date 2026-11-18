import fs from 'node:fs';

import { CommunitiesPage } from '../pages/communities.page';
import { CommunityDetailPage } from '../pages/community-detail.page';
import { LoginPage } from '../pages/login.page';
import { test, expect } from '../fixtures/cleanup.fixture';
import { ALT_AUTH_FILE } from '../support/auth.constants';
import { AppRoute } from '../test-data/routes';

const MAPLE_CLASS = 'Maple Class';
const MAPLE_CLASS_ADMIN_LINE = '4 families · You’re an admin';

const communitiesUrlPattern = new RegExp(`${AppRoute.Communities}(\\?.*)?$`);
const loginUrlPattern = new RegExp(`${AppRoute.Login}(\\?.*)?$`);
const communityUuidUrlPattern = new RegExp(
  `${AppRoute.Communities}/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}(\\?.*)?$`,
  'i',
);
const mapleClassUrlPattern = new RegExp(`${AppRoute.CommunityMapleClass}(\\?.*)?$`);

const familyBAuthMissingReason =
  'ALT_AUTH_FILE is missing; Family B storage state was not created. Set APP_ALT_USER_EMAIL and APP_ALT_USER_PASSWORD.';

test.describe('AQPBT-20 Communities — your communities list', () => {
  test(
    'communities page shows banner, heading, description and + Create group (AC1)',
    { tag: '@smoke' },
    async ({ page }) => {
      const communities = new CommunitiesPage(page);

      await communities.goto();

      await expect(page).toHaveURL(communitiesUrlPattern);
      await expect(communities.communitiesBanner).toBeVisible();
      await expect(communities.yourCommunitiesHeading).toBeVisible();
      await expect(communities.description).toBeVisible();
      await expect(communities.createGroupLink).toBeVisible();
    },
  );

  test('Family A sees the Maple Class group card (AC2)', { tag: '@sanity' }, async ({ page }) => {
    const communities = new CommunitiesPage(page);

    await communities.goto();

    const card = communities.groupCard(MAPLE_CLASS);
    await expect(page).toHaveURL(communitiesUrlPattern);
    await expect(card).toBeVisible();
    await expect(card.getByRole('heading', { name: MAPLE_CLASS, level: 3 })).toBeVisible();
    await expect(card.getByText('Class', { exact: true })).toBeVisible();
    await expect(card.getByText(MAPLE_CLASS_ADMIN_LINE, { exact: true })).toBeVisible();
  });

  test(
    'opening Maple Class lands on the group page with tabs (AC3)',
    { tag: '@sanity' },
    async ({ page }) => {
      const communities = new CommunitiesPage(page);
      const detail = new CommunityDetailPage(page);

      await communities.goto();
      await communities.openCommunity(MAPLE_CLASS);

      await expect(page).toHaveURL(communityUuidUrlPattern);
      await expect(page).toHaveURL(mapleClassUrlPattern);
      await expect(detail.communityHeading).toHaveText(MAPLE_CLASS);
      await expect(detail.membersTab).toBeVisible();
      await expect(detail.membersTab).toHaveAttribute('aria-selected', 'true');
      await expect(detail.eventsTab).toBeVisible();
      await expect(detail.announcementsTab).toBeVisible();
    },
  );

  test('← All communities returns to the list (AC4)', { tag: '@sanity' }, async ({ page }) => {
    const communities = new CommunitiesPage(page);
    const detail = new CommunityDetailPage(page);

    await detail.gotoMapleClass();
    await expect(detail.communityHeading).toHaveText(MAPLE_CLASS);

    await detail.allCommunitiesLink.click();

    await expect(page).toHaveURL(communitiesUrlPattern);
    await expect(communities.yourCommunitiesHeading).toBeVisible();
  });

  test(
    'Family A with a group does not see the empty state (N2)',
    { tag: '@regression' },
    async ({ page }) => {
      const communities = new CommunitiesPage(page);

      await communities.goto();

      await expect(communities.groupCard(MAPLE_CLASS)).toBeVisible();
      await expect(communities.emptyStateHeading).toHaveCount(0);
      await expect(communities.createFirstGroupLink).toHaveCount(0);
    },
  );
});

test.describe('AQPBT-20 Communities — Family B', () => {
  test.use({ storageState: ALT_AUTH_FILE });

  test.beforeAll(() => {
    test.skip(!fs.existsSync(ALT_AUTH_FILE), familyBAuthMissingReason);
  });

  test(
    'Family B with no communities sees the empty state (AC5)',
    { tag: '@sanity' },
    async ({ page }) => {
      const communities = new CommunitiesPage(page);

      await communities.goto();

      await expect(page).toHaveURL(communitiesUrlPattern);
      await expect(communities.emptyStateHeading).toBeVisible();
      await expect(communities.createFirstGroupLink).toBeVisible();
      await expect(communities.createFirstGroupLink).toHaveAttribute('href', AppRoute.CommunitiesNew);
    },
  );

  test(
    'Family B does not see Family A Maple Class card (N1)',
    { tag: '@regression' },
    async ({ page }) => {
      const communities = new CommunitiesPage(page);

      await communities.goto();

      await expect(communities.emptyStateHeading).toBeVisible();
      await expect(communities.groupCard(MAPLE_CLASS)).toHaveCount(0);
    },
  );
});

test.describe('AQPBT-20 Communities — logged out', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('logged-out visitor is redirected to log in (AC6)', { tag: '@sanity' }, async ({ page }) => {
    const communities = new CommunitiesPage(page);
    const loginPage = new LoginPage(page);

    await communities.goto();

    await expect(page).toHaveURL(loginUrlPattern);
    await expect(loginPage.welcomeHeading).toBeVisible();
  });
});
