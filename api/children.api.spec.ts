import { API_CHILDREN_PATH, deleteChild } from '../support/api-client';
import { buildCreateChildPayload } from '../test-data/factories/child.factory';
import { assertCreatedChildBody, assertMeBody, isRecord } from './catalog-assertions';
import { expect, test, trackRecord } from './fixtures';

interface MeChild {
  id: string;
  firstName: string;
}

function findChildInMe(body: unknown, firstName: string): MeChild | undefined {
  if (!isRecord(body) || !isRecord(body.family)) return undefined;
  const children = body.family.children;
  if (!Array.isArray(children)) return undefined;
  for (const entry of children) {
    if (!isRecord(entry)) continue;
    if (entry.firstName === firstName && typeof entry.id === 'string') {
      return { id: entry.id, firstName: entry.firstName as string };
    }
  }
  return undefined;
}

test(
  'POST /api/v1/children create appears on GET /api/v1/me and DELETE removes',
  { tag: '@api' },
  async ({ apiMain }) => {
    const payload = buildCreateChildPayload();

    const createResponse = await apiMain.post(API_CHILDREN_PATH, { data: payload });
    expect(createResponse.status()).toBe(201);
    const created: unknown = await createResponse.json();
    assertCreatedChildBody(created);
    if (!isRecord(created) || typeof created.id !== 'string') return;

    trackRecord({ type: 'child', id: created.id, owner: 'main' });

    const meResponse = await apiMain.get('/api/v1/me');
    expect(meResponse.status()).toBe(200);
    const meBody: unknown = await meResponse.json();
    assertMeBody(meBody);
    const found = findChildInMe(meBody, payload.firstName);
    expect(found).toBeDefined();
    expect(found?.id).toBe(created.id);

    const deleteResult = await deleteChild(apiMain, created.id);
    expect(deleteResult.ok).toBeTruthy();
    expect(deleteResult.status).toBe(204);
  },
);
