import { UNAUTHENTICATED_GET_STATUS } from './catalog-constants';
import { assertMeBody, expectJsonContentType } from './catalog-assertions';
import { expect, test } from './fixtures';

test('GET /api/v1/me returns profile JSON', { tag: '@api' }, async ({ apiMain }) => {
  const response = await apiMain.get('/api/v1/me');
  expect(response.status()).toBe(200);
  expectJsonContentType(response.headers()['content-type']);
  assertMeBody(await response.json());
});

test('GET /api/v1/me without token is rejected', { tag: '@api' }, async ({ apiAnonymous }) => {
  const response = await apiAnonymous.get('/api/v1/me');
  expect(response.status()).toBe(UNAUTHENTICATED_GET_STATUS);
});
