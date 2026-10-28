import { DashboardPage } from '../../pages/dashboard.page';
import { API_CHILDREN_PATH, createApiContextForOwner } from '../../support/api-client';
import { buildCreateChildPayload } from '../../test-data/factories/child.factory';
import { test, expect, trackRecord } from '../../fixtures/cleanup.fixture';

interface MeChild {
  id: string;
  firstName: string;
  age: number;
  gender: string;
  interests: string[];
}

interface MeResponse {
  family: { name: string; children: MeChild[] };
}

function genderLabel(gender: string): string {
  if (gender === 'boy') return 'Boy';
  if (gender === 'girl') return 'Girl';
  return gender;
}

function childSummaryLine(child: MeChild): string {
  return `${child.firstName}, ${child.age} · ${genderLabel(child.gender)}`;
}

test(
  'API-created child appears on dashboard, UI remove clears it from GET /api/v1/me',
  { tag: '@destructive' },
  async ({ page }) => {
    let familyName = '';
    let summaryLine = '';
    let childId = '';
    let kidsBefore = 0;

    await test.step('API: arrange', async () => {
      const api = await createApiContextForOwner('main');
      try {
        const meResponse = await api.get('/api/v1/me');
        expect(meResponse.ok()).toBeTruthy();
        const me = (await meResponse.json()) as MeResponse;
        familyName = me.family.name;
        kidsBefore = me.family.children.length;

        const payload = buildCreateChildPayload();
        const createResponse = await api.post(API_CHILDREN_PATH, { data: payload });
        expect(createResponse.status()).toBe(201);
        const created = (await createResponse.json()) as MeChild;
        childId = created.id;
        trackRecord({ type: 'child', id: childId, owner: 'main' });
        summaryLine = childSummaryLine(created);
      } finally {
        await api.dispose();
      }
    });

    await test.step('UI: check', async () => {
      const dashboard = new DashboardPage(page);
      await dashboard.goto();
      await expect(dashboard.childSummaryLocator(familyName, summaryLine)).toBeVisible();
      await expect.poll(() => dashboard.getMyKidsCount()).toBe(kidsBefore + 1);
    });

    await test.step('UI: act', async () => {
      const dashboard = new DashboardPage(page);
      await dashboard.removeChild(familyName, summaryLine);
    });

    await test.step('API: prove', async () => {
      const api = await createApiContextForOwner('main');
      try {
        await expect
          .poll(async () => {
            const response = await api.get('/api/v1/me');
            expect(response.ok()).toBeTruthy();
            const me = (await response.json()) as MeResponse;
            return me.family.children.some((child) => child.id === childId);
          })
          .toBe(false);
      } finally {
        await api.dispose();
      }
    });
  },
);
