import { UNAUTHENTICATED_GET_STATUS } from './catalog-constants';
import { assertEventItem, expectJsonContentType } from './catalog-assertions';
import { expect, test } from './fixtures';

test('GET /api/v1/events returns event list JSON', { tag: '@api' }, async ({ apiMain }) => {
  const response = await apiMain.get('/api/v1/events');
  expect(response.status()).toBe(200);
  expectJsonContentType(response.headers()['content-type']);

  const body: unknown = await response.json();
  expect(Array.isArray(body)).toBeTruthy();
  if (!Array.isArray(body)) return;
  if (body.length > 0) assertEventItem(body[0]);
});

test('GET /api/v1/events without token is rejected', { tag: '@api' }, async ({ apiAnonymous }) => {
  const response = await apiAnonymous.get('/api/v1/events');
  expect(response.status()).toBe(UNAUTHENTICATED_GET_STATUS);
});
