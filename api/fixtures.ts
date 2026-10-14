import type { APIRequestContext } from '@playwright/test';
import { request } from '@playwright/test';

import { test as cleanupTest } from '../fixtures/cleanup.fixture';
import { createApiContextForOwner } from '../support/api-client';

type ApiFixtures = {
  apiMain: APIRequestContext;
  apiAlt: APIRequestContext;
  apiAnonymous: APIRequestContext;
};

export const test = cleanupTest.extend<ApiFixtures>({
  apiMain: async ({}, use) => {
    const context = await createApiContextForOwner('main');
    await use(context);
    await context.dispose();
  },

  apiAlt: async ({}, use) => {
    const context = await createApiContextForOwner('alt');
    await use(context);
    await context.dispose();
  },

  apiAnonymous: async ({}, use) => {
    const baseURL = process.env.APP_URL;
    if (!baseURL) {
      throw new Error('APP_URL is required for API tests.');
    }
    const context = await request.newContext({ baseURL });
    await use(context);
    await context.dispose();
  },
});

export { expect, trackRecord } from '../fixtures/cleanup.fixture';
