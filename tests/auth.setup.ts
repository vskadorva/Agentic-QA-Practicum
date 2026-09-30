import fs from 'node:fs';
import path from 'node:path';

import { expect, test as setup } from '@playwright/test';

import { LoginPage } from '../pages';
import { ALT_AUTH_FILE, AUTH_FILE } from '../support/auth.constants';
import { AppRoute } from '../test-data/routes';

const signedInAppUrl = new RegExp(`${AppRoute.Dashboard}(\\?.*)?$`);
const loginRouteUrl = new RegExp(`${AppRoute.Login}(\\?.*)?$`);

/** Matches default values in `.env.example` — not valid BuddyTime accounts. */
const ALT_ENV_PLACEHOLDERS = {
  email: 'alt-user@example.com',
  password: 'your-alt-password-here',
} as const;

function altFamilyAuthSkipReason(): string | undefined {
  const email = process.env.APP_ALT_USER_EMAIL?.trim();
  const password = process.env.APP_ALT_USER_PASSWORD;

  if (!email || !password) {
    return 'Set APP_ALT_USER_EMAIL and APP_ALT_USER_PASSWORD to generate alt-user storage state.';
  }

  if (email === ALT_ENV_PLACEHOLDERS.email || password === ALT_ENV_PLACEHOLDERS.password) {
    return 'APP_ALT_USER_EMAIL and APP_ALT_USER_PASSWORD are still .env.example placeholders; set real Family B credentials or remove them to skip.';
  }

  return undefined;
}

setup('authenticate main family', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.submit(process.env.APP_USER_EMAIL!, process.env.APP_USER_PASSWORD!);

  await expect(page).toHaveURL(signedInAppUrl);
  await expect(page).not.toHaveURL(loginRouteUrl);

  fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true });
  await page.context().storageState({ path: AUTH_FILE });
});

setup('authenticate second family', async ({ page }) => {
  const skipReason = altFamilyAuthSkipReason();
  setup.skip(skipReason !== undefined, skipReason ?? '');

  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.submit(
    process.env.APP_ALT_USER_EMAIL!,
    process.env.APP_ALT_USER_PASSWORD!,
  );

  await expect(page).toHaveURL(signedInAppUrl);
  await expect(page).not.toHaveURL(loginRouteUrl);

  fs.mkdirSync(path.dirname(ALT_AUTH_FILE), { recursive: true });
  await page.context().storageState({ path: ALT_AUTH_FILE });
});
