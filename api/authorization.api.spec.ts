import type { APIRequestContext } from '@playwright/test';

import { API_CHILDREN_PATH } from '../support/api-client';
import { buildCreateChildPayload } from '../test-data/factories/child.factory';
import { assertCreatedChildBody, assertMeBody, isRecord } from './catalog-assertions';
import {
  UNAUTHENTICATED_DELETE_CHILD_STATUS,
  UNAUTHENTICATED_GET_STATUS,
  UNAUTHORIZED_DELETE_CHILD_STATUS,
} from './catalog-constants';
import { expect, test, trackRecord } from './fixtures';

function childIdsInMe(body: unknown): string[] {
  if (!isRecord(body) || !isRecord(body.family)) return [];
  const children = body.family.children;
  if (!Array.isArray(children)) return [];
  return children
    .filter((entry): entry is Record<string, unknown> => isRecord(entry) && typeof entry.id === 'string')
    .map((entry) => entry.id as string);
}

async function createTrackedChildForMain(apiMain: APIRequestContext): Promise<string> {
  const payload = buildCreateChildPayload();
  const createResponse = await apiMain.post(API_CHILDREN_PATH, { data: payload });
  expect(createResponse.status()).toBe(201);
  const created: unknown = await createResponse.json();
  assertCreatedChildBody(created);
  if (!isRecord(created) || typeof created.id !== 'string') {
    throw new Error('Created child missing id');
  }
  trackRecord({ type: 'child', id: created.id, owner: 'main' });
  return created.id;
}

test(
  'DELETE /api/v1/children/{id} by other family does not remove main family child',
  { tag: '@api' },
  async ({ apiMain, apiAlt }) => {
    const childId = await createTrackedChildForMain(apiMain);

    const deleteResponse = await apiAlt.delete(`${API_CHILDREN_PATH}/${encodeURIComponent(childId)}`);
    expect(deleteResponse.status()).toBe(UNAUTHORIZED_DELETE_CHILD_STATUS);

    const mainMeResponse = await apiMain.get('/api/v1/me');
    expect(mainMeResponse.status()).toBe(200);
    const mainMeBody: unknown = await mainMeResponse.json();
    assertMeBody(mainMeBody);
    expect(childIdsInMe(mainMeBody)).toContain(childId);

    const altMeResponse = await apiAlt.get('/api/v1/me');
    expect(altMeResponse.status()).toBe(200);
    expect(childIdsInMe(await altMeResponse.json())).not.toContain(childId);
  },
);

test(
  'DELETE /api/v1/children/{id} without token does not remove main family child',
  { tag: '@api' },
  async ({ apiMain, apiAnonymous }) => {
    const childId = await createTrackedChildForMain(apiMain);

    const deleteResponse = await apiAnonymous.delete(
      `${API_CHILDREN_PATH}/${encodeURIComponent(childId)}`,
    );
    expect(deleteResponse.status()).toBe(UNAUTHENTICATED_DELETE_CHILD_STATUS);

    const mainMeResponse = await apiMain.get('/api/v1/me');
    expect(mainMeResponse.status()).toBe(200);
    const mainMeBody: unknown = await mainMeResponse.json();
    assertMeBody(mainMeBody);
    expect(childIdsInMe(mainMeBody)).toContain(childId);
  },
);

test(
  'GET /api/v1/communities/{id} without token using family A community id',
  { tag: '@api' },
  async ({ apiMain, apiAnonymous }) => {
    const communitiesResponse = await apiMain.get('/api/v1/communities');
    const communities: unknown = await communitiesResponse.json();
    let mainCommunityId: string | undefined;
    if (
      communitiesResponse.status() === 200 &&
      Array.isArray(communities) &&
      communities.length > 0
    ) {
      const first = communities[0];
      if (isRecord(first) && typeof first.id === 'string') {
        mainCommunityId = first.id;
      }
    }

    expect(mainCommunityId, 'family A must have a community id').toBeTruthy();
    const response = await apiAnonymous.get(
      `/api/v1/communities/${encodeURIComponent(mainCommunityId as string)}`,
    );
    expect(response.status()).toBe(UNAUTHENTICATED_GET_STATUS);
  },
);
