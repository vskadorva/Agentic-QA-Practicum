import {
  ADD_CHILD_INTEREST_CHIP_LABELS,
  DASHBOARD_AVATAR_ICON_NAMES,
  DashboardPage,
} from '../pages/dashboard.page';
import { API_CHILDREN_PATH, createApiContextForOwner } from '../support/api-client';
import { AppRoute } from '../test-data/routes';
import { test, expect, trackRecord } from '../fixtures/cleanup.fixture';

const dashboardUrlPattern = new RegExp(`${AppRoute.Dashboard}(\\?.*)?$`);

interface MeChild {
  id: string;
  firstName: string;
  age: number;
  gender: string;
  interests: string[];
}

interface MeResponse {
  parent: { displayName: string };
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

async function fetchFamilyDashboardContext(): Promise<MeResponse> {
  const api = await createApiContextForOwner('main');
  const response = await api.get('/api/v1/me');
  expect(response.ok()).toBeTruthy();
  const body = (await response.json()) as MeResponse;
  await api.dispose();
  return body;
}

async function readChildInterestLabels(
  dashboard: DashboardPage,
  familyName: string,
  summaryLine: string,
  interests: string[],
): Promise<string[]> {
  const row = dashboard.childRowBySummary(familyName, summaryLine);
  const labels: string[] = [];
  for (const interest of interests) {
    const tag = row.getByText(interest, { exact: true });
    labels.push((await tag.innerText()).trim());
  }
  return labels;
}

async function arrangeDisposableChild(): Promise<{ summaryLine: string; firstName: string }> {
  const firstName = `Tmp${Date.now()}`;
  const api = await createApiContextForOwner('main');
  const response = await api.post(API_CHILDREN_PATH, {
    data: {
      firstName,
      birthYear: 2019,
      birthMonth: 4,
      gender: 'girl',
      interests: ['art'],
    },
  });
  expect(response.status()).toBe(201);
  const created = (await response.json()) as MeChild;
  trackRecord({ type: 'child', id: created.id, owner: 'main' });
  await api.dispose();
  return { firstName, summaryLine: childSummaryLine(created) };
}

test.describe('AQPBT-5 Dashboard — manage kids', () => {
  test.describe.configure({ mode: 'serial' });
  test(
    'family block shows children, controls, and My Kids count (AC1)',
    { tag: '@smoke' },
    async ({ page }) => {
      const me = await fetchFamilyDashboardContext();
      const dashboard = new DashboardPage(page);
      const { name: familyName, children } = me.family;

      await dashboard.goto();
      await expect(page).toHaveURL(dashboardUrlPattern);
      await expect(dashboard.dashboardBanner).toBeVisible();

      await expect(dashboard.familyNameLocator(familyName)).toBeVisible();
      await expect(dashboard.parentDisplayNameLocator(familyName, me.parent.displayName)).toBeVisible();

      for (const child of children) {
        const summary = childSummaryLine(child);
        const row = dashboard.childRowBySummary(familyName, summary);
        await expect(dashboard.childSummaryLocator(familyName, summary)).toBeVisible();
        await expect(row.getByRole('button', { name: 'Change avatar' })).toBeVisible();
        await expect(row.getByRole('button', { name: 'remove' })).toBeVisible();

        for (const interest of child.interests) {
          await expect(
            dashboard.childRowBySummary(familyName, summary).getByText(interest, { exact: true }),
          ).toBeVisible();
        }
      }

      await expect(dashboard.addChildForm.firstNameInput).toBeVisible();
      await expect(dashboard.addChildForm.birthYearInput).toBeVisible();
      await expect(dashboard.addChildForm.birthMonthInput).toBeVisible();
      await expect(dashboard.addChildForm.interestsInput).toBeVisible();
      await expect(dashboard.addChildForm.genderCombobox).toBeVisible();
      await expect(dashboard.addChildForm.addChildButton).toBeVisible();

      for (const iconName of DASHBOARD_AVATAR_ICON_NAMES) {
        await expect(dashboard.addChildAvatarIconButton(iconName)).toBeVisible();
      }

      for (const chipLabel of ADD_CHILD_INTEREST_CHIP_LABELS) {
        await expect(dashboard.addChildInterestChip(chipLabel)).toBeVisible();
      }

      const rowCount = await dashboard.getChildRowCount(familyName);
      await expect.poll(() => dashboard.getMyKidsCount()).toBe(rowCount);
    },
  );

  test(
    'Change avatar opens icon grid, gender combobox, and done (AC2)',
    { tag: '@sanity' },
    async ({ page }) => {
      const me = await fetchFamilyDashboardContext();
      const child = me.family.children[0];
      expect(child).toBeDefined();

      const dashboard = new DashboardPage(page);
      const familyName = me.family.name;
      const summary = childSummaryLine(child);

      await dashboard.goto();
      await expect(dashboard.dashboardBanner).toBeVisible();

      const picker = await dashboard.openAvatarPickerForChild(familyName, summary);
      await expect(picker.doneButton).toBeVisible();
      await expect(picker.genderCombobox).toBeVisible();
      await expect(picker.genderCombobox).toContainText('Prefer not to say');
      await expect(picker.genderCombobox).toContainText('Boy');
      await expect(picker.genderCombobox).toContainText('Girl');

      for (const iconName of DASHBOARD_AVATAR_ICON_NAMES) {
        await expect(picker.avatarIconButton(iconName)).toBeVisible();
      }
    },
  );

  test(
    'done without changing avatar closes editor and preserves row (AC3)',
    { tag: '@sanity' },
    async ({ page }) => {
      const me = await fetchFamilyDashboardContext();
      const child = me.family.children.find((c) => c.interests.length > 0) ?? me.family.children[0];
      expect(child).toBeDefined();

      const dashboard = new DashboardPage(page);
      const familyName = me.family.name;
      const summary = childSummaryLine(child);

      await dashboard.goto();
      const tagsBefore = await readChildInterestLabels(dashboard, familyName, summary, child.interests);

      const picker = await dashboard.openAvatarPickerForChild(familyName, summary);
      await expect(picker.doneButton).toBeVisible();
      await picker.done();

      await expect(picker.doneButton).toBeHidden();
      await expect(dashboard.childSummaryLocator(familyName, summary)).toBeVisible();
      const tagsAfter = await readChildInterestLabels(dashboard, familyName, summary, child.interests);
      expect(tagsAfter).toEqual(tagsBefore);
    },
  );

  test('+ LEGO appends LEGO to interests field (AC4)', { tag: '@sanity' }, async ({ page }) => {
    const dashboard = new DashboardPage(page);

    await dashboard.goto();
    await expect(dashboard.dashboardBanner).toBeVisible();
    await expect(dashboard.addChildForm.interestsInput).toBeVisible();
    await dashboard.addChildForm.addInterestChip('+ LEGO');
    await expect(dashboard.addChildForm.interestsInput).toHaveValue(/LEGO/);
  });

  test(
    'partial add-child fill without valid submit does not create a child (N1)',
    { tag: '@sanity' },
    async ({ page }) => {
      const me = await fetchFamilyDashboardContext();
      const dashboard = new DashboardPage(page);
      const familyName = me.family.name;
      const draftName = `Draft${Date.now()}`;

      await dashboard.goto();
      await expect(dashboard.dashboardBanner).toBeVisible();
      await expect(dashboard.addChildForm.firstNameInput).toBeVisible();
      const kidsBefore = await dashboard.getMyKidsCount();

      await dashboard.addChildForm.firstNameInput.fill(draftName);
      await dashboard.addChildForm.addInterestChip('+ LEGO');
      await expect(dashboard.addChildForm.interestsInput).toHaveValue(/LEGO/);

      await expect(dashboard.familyBlock(familyName).getByText(new RegExp(`^${draftName},`))).toHaveCount(0);
      await expect.poll(() => dashboard.getMyKidsCount()).toBe(kidsBefore);
    },
  );

  test(
    'Remove child drops row and decrements My Kids (AC6)',
    { tag: '@destructive' },
    async ({ page }) => {
      const me = await fetchFamilyDashboardContext();
      const disposable = await arrangeDisposableChild();
      const dashboard = new DashboardPage(page);
      const familyName = me.family.name;

      await dashboard.goto();
      await expect(dashboard.childSummaryLocator(familyName, disposable.summaryLine)).toBeVisible();

      const kidsBefore = await dashboard.getMyKidsCount();
      await dashboard.removeChild(familyName, disposable.summaryLine);

      await expect(dashboard.childSummaryLocator(familyName, disposable.summaryLine)).toBeHidden();
      await expect.poll(() => dashboard.getMyKidsCount()).toBe(kidsBefore - 1);
      await expect(page).toHaveURL(dashboardUrlPattern);
    },
  );

  test(
    'avatar editor closes when Change avatar is toggled again (E1)',
    { tag: '@sanity' },
    async ({ page }) => {
      const me = await fetchFamilyDashboardContext();
      const child = me.family.children[0];
      expect(child).toBeDefined();

      const dashboard = new DashboardPage(page);
      const familyName = me.family.name;
      const summary = childSummaryLine(child);

      await dashboard.goto();
      const picker = await dashboard.openAvatarPickerForChild(familyName, summary);
      await expect(picker.doneButton).toBeVisible();

      await dashboard.openAvatarPickerForChild(familyName, summary);
      await expect(picker.doneButton).toBeHidden();
    },
  );

  test(
    'Add child with required fields empty focuses Birth year and does not add a row (AC5)',
    { tag: '@regression' },
    async ({ page }) => {
      const me = await fetchFamilyDashboardContext();
      const dashboard = new DashboardPage(page);
      const familyName = me.family.name;

      await dashboard.goto();
      await expect(dashboard.dashboardBanner).toBeVisible();
      await expect(dashboard.addChildForm.addChildButton).toBeVisible();
      const kidsBefore = await dashboard.getMyKidsCount();
      const rowsBefore = await dashboard.getChildRowCount(familyName);

      await dashboard.addChildForm.addChildButton.scrollIntoViewIfNeeded();
      await dashboard.addChildForm.submit();

      await expect(dashboard.addChildForm.birthYearInput).toBeFocused();
      await expect.poll(() => dashboard.getChildRowCount(familyName)).toBe(rowsBefore);
      await expect.poll(() => dashboard.getMyKidsCount()).toBe(kidsBefore);
    },
  );
});
