import { UNAUTHENTICATED_GET_STATUS } from './catalog-constants';
import { assertConnectionItem, expectJsonContentType } from './catalog-assertions';
import { expect, test } from './fixtures';

test('GET /api/v1/connections returns circle JSON', { tag: '@api' }, async ({ apiMain }) => {
  const response = await apiMain.get('/api/v1/connections');
  expect(response.status()).toBe(200);
  expectJsonContentType(response.headers()['content-type']);

  const body: unknown = await response.json();
  expect(Array.isArray(body)).toBeTruthy();
  if (!Array.isArray(body)) return;
  if (body.length > 0) assertConnectionItem(body[0]);
});

test('GET /api/v1/connections without token is rejected', { tag: '@api' }, async ({ apiAnonymous }) => {
  const response = await apiAnonymous.get('/api/v1/connections');
  expect(response.status()).toBe(UNAUTHENTICATED_GET_STATUS);
});
