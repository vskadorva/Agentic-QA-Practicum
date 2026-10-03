import { test as base, expect, type Response } from '@playwright/test';

import { API_CHILDREN_PATH } from '../support/api-client';
import { MOCK_RECORD_ID_PREFIX } from '../support/mock-api';
import type { RecordOwner } from '../support/record-tracker';
import { trackRecord } from '../support/record-tracker';

export { expect, trackRecord };

interface CreateChildResponse {
  id?: string;
}

type CleanupFixtures = {
  recordOwner: RecordOwner;
};

function isMockId(id: string): boolean {
  return id.startsWith(MOCK_RECORD_ID_PREFIX);
}

function createPathMatches(url: string): boolean {
  try {
    const pathname = new URL(url).pathname;
    return pathname === API_CHILDREN_PATH || pathname.endsWith(`${API_CHILDREN_PATH}`);
  } catch {
    return url.includes(API_CHILDREN_PATH);
  }
}

async function tryTrackChildCreate(response: Response, owner: RecordOwner): Promise<void> {
  const request = response.request();
  if (request.method() !== 'POST') return;
  if (!createPathMatches(response.url())) return;
  if (response.status() !== 201) return;

  let body: CreateChildResponse;
  try {
    body = (await response.json()) as CreateChildResponse;
  } catch {
    return;
  }

  const id = body.id;
  if (typeof id !== 'string' || id.length === 0) return;
  if (isMockId(id)) return;

  trackRecord({ type: 'child', id, owner });
}

export const test = base.extend<CleanupFixtures>({
  recordOwner: ['main', { option: true }],

  page: async ({ page, recordOwner }, use) => {
    const onResponse = (response: Response): void => {
      void tryTrackChildCreate(response, recordOwner);
    };
    page.on('response', onResponse);
    await use(page);
    page.off('response', onResponse);
  },
});
