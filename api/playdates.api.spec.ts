import { MATCHES_DAYS_QUERY, UNAUTHENTICATED_GET_STATUS } from './catalog-constants';
import { assertMatchItem, assertPlaydateItem, expectJsonContentType } from './catalog-assertions';
import { expect, test } from './fixtures';

test('GET /api/v1/playdates returns playdate list JSON', { tag: '@api' }, async ({ apiMain }) => {
  const response = await apiMain.get('/api/v1/playdates');
  expect(response.status()).toBe(200);
  expectJsonContentType(response.headers()['content-type']);

  const body: unknown = await response.json();
  expect(Array.isArray(body)).toBeTruthy();
  if (!Array.isArray(body)) return;
  if (body.length > 0) assertPlaydateItem(body[0]);
});

test(
  'GET /api/v1/playdates?filter=upcoming returns playdate list JSON',
  { tag: '@api' },
  async ({ apiMain }) => {
    const response = await apiMain.get('/api/v1/playdates?filter=upcoming');
    expect(response.status()).toBe(200);
    expectJsonContentType(response.headers()['content-type']);

    const body: unknown = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
    if (!Array.isArray(body)) return;
    if (body.length > 0) assertPlaydateItem(body[0]);
  },
);

test(
  'GET /api/v1/matches?days={n} returns match slots JSON',
  { tag: '@api' },
  async ({ apiMain }) => {
    const response = await apiMain.get(`/api/v1/matches?days=${MATCHES_DAYS_QUERY}`);
    expect(response.status()).toBe(200);
    expectJsonContentType(response.headers()['content-type']);

    const body: unknown = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
    if (!Array.isArray(body)) return;
    if (body.length > 0) assertMatchItem(body[0]);
  },
);

test('GET /api/v1/playdates without token is rejected', { tag: '@api' }, async ({ apiAnonymous }) => {
  const response = await apiAnonymous.get('/api/v1/playdates');
  expect(response.status()).toBe(UNAUTHENTICATED_GET_STATUS);
});

test(
  'GET /api/v1/playdates?filter=upcoming without token is rejected',
  { tag: '@api' },
  async ({ apiAnonymous }) => {
    const response = await apiAnonymous.get('/api/v1/playdates?filter=upcoming');
    expect(response.status()).toBe(UNAUTHENTICATED_GET_STATUS);
  },
);

test(
  'GET /api/v1/matches without token is rejected',
  { tag: '@api' },
  async ({ apiAnonymous }) => {
    const response = await apiAnonymous.get(`/api/v1/matches?days=${MATCHES_DAYS_QUERY}`);
    expect(response.status()).toBe(UNAUTHENTICATED_GET_STATUS);
  },
);
