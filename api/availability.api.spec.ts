import { UNAUTHENTICATED_GET_STATUS } from './catalog-constants';
import { assertAvailabilityBody, expectJsonContentType } from './catalog-assertions';
import { expect, test } from './fixtures';

test('GET /api/v1/availability returns rules and exceptions', { tag: '@api' }, async ({ apiMain }) => {
  const response = await apiMain.get('/api/v1/availability');
  expect(response.status()).toBe(200);
  expectJsonContentType(response.headers()['content-type']);
  assertAvailabilityBody(await response.json());
});

test('GET /api/v1/availability without token is rejected', { tag: '@api' }, async ({ apiAnonymous }) => {
  const response = await apiAnonymous.get('/api/v1/availability');
  expect(response.status()).toBe(UNAUTHENTICATED_GET_STATUS);
});
