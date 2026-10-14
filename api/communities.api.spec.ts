import { UNAUTHENTICATED_GET_STATUS } from './catalog-constants';
import {
  assertCommunityDetailBody,
  assertCommunityListItem,
  expectJsonContentType,
  isRecord,
} from './catalog-assertions';
import { expect, test } from './fixtures';

test('GET /api/v1/communities returns community list JSON', { tag: '@api' }, async ({ apiMain }) => {
  const response = await apiMain.get('/api/v1/communities');
  expect(response.status()).toBe(200);
  expectJsonContentType(response.headers()['content-type']);

  const body: unknown = await response.json();
  expect(Array.isArray(body)).toBeTruthy();
  if (!Array.isArray(body)) return;
  if (body.length > 0) assertCommunityListItem(body[0]);
});

test(
  'GET /api/v1/communities/{id} returns community detail JSON',
  { tag: '@api' },
  async ({ apiMain }) => {
    const listResponse = await apiMain.get('/api/v1/communities');
    expect(listResponse.status()).toBe(200);
    const list: unknown = await listResponse.json();
    expect(Array.isArray(list)).toBeTruthy();
    if (!Array.isArray(list) || list.length === 0) {
      test.skip(true, 'No communities returned to resolve {id}');
      return;
    }
    const first = list[0];
    expect(isRecord(first)).toBeTruthy();
    if (!isRecord(first) || typeof first.id !== 'string') return;

    const detailResponse = await apiMain.get(`/api/v1/communities/${encodeURIComponent(first.id)}`);
    expect(detailResponse.status()).toBe(200);
    expectJsonContentType(detailResponse.headers()['content-type']);
    assertCommunityDetailBody(await detailResponse.json());
  },
);

test('GET /api/v1/communities without token is rejected', { tag: '@api' }, async ({ apiAnonymous }) => {
  const response = await apiAnonymous.get('/api/v1/communities');
  expect(response.status()).toBe(UNAUTHENTICATED_GET_STATUS);
});

test(
  'GET /api/v1/communities/{id} without token is rejected',
  { tag: '@api' },
  async ({ apiMain, apiAnonymous }) => {
    const listResponse = await apiMain.get('/api/v1/communities');
    expect(listResponse.status()).toBe(200);
    const list: unknown = await listResponse.json();
    expect(Array.isArray(list)).toBeTruthy();
    if (!Array.isArray(list) || list.length === 0) {
      test.skip(true, 'No communities returned to resolve {id}');
      return;
    }
    const first = list[0];
    expect(isRecord(first)).toBeTruthy();
    if (!isRecord(first) || typeof first.id !== 'string') return;

    const response = await apiAnonymous.get(
      `/api/v1/communities/${encodeURIComponent(first.id)}`,
    );
    expect(response.status()).toBe(UNAUTHENTICATED_GET_STATUS);
  },
);
