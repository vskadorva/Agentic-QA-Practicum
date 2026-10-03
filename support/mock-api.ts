import type { Page, Route } from '@playwright/test';

export const MOCK_RECORD_ID_PREFIX = 'mock-';

const ME_ROUTE = '**/api/v1/me';
const CONNECTIONS_ROUTE = '**/api/v1/connections';

function isGet(route: Route): boolean {
  return route.request().method() === 'GET';
}

function jsonResponse(status: number, body: unknown): Parameters<Route['fulfill']>[0] {
  return {
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
  };
}

function emptyChildrenPatch(body: Record<string, unknown>): Record<string, unknown> {
  const next = { ...body };
  if (Array.isArray(next.children)) {
    next.children = [];
  }
  const family = next.family;
  if (family && typeof family === 'object') {
    next.family = { ...(family as Record<string, unknown>), children: [] };
  }
  return next;
}

/** GET /api/v1/me — force an empty children list (passthrough + patch when possible). */
export async function routeMeWithEmptyChildren(page: Page): Promise<void> {
  await page.route(ME_ROUTE, async (route) => {
    if (!isGet(route)) {
      await route.continue();
      return;
    }
    try {
      const response = await route.fetch();
      const body = (await response.json()) as Record<string, unknown>;
      await route.fulfill({
        status: response.status(),
        headers: response.headers(),
        contentType: 'application/json',
        body: JSON.stringify(emptyChildrenPatch(body)),
      });
    } catch {
      await route.fulfill(jsonResponse(200, { children: [] }));
    }
  });
}

/** GET /api/v1/me — deterministic 503 for resilience tests. */
export async function routeMeWithServerError(page: Page): Promise<void> {
  await page.route(ME_ROUTE, async (route) => {
    if (!isGet(route)) {
      await route.continue();
      return;
    }
    await route.fulfill(jsonResponse(503, { error: 'Service unavailable' }));
  });
}

/** GET /api/v1/connections — empty circle list. */
export async function routeConnectionsWithEmptyList(page: Page): Promise<void> {
  await page.route(CONNECTIONS_ROUTE, async (route) => {
    if (!isGet(route)) {
      await route.continue();
      return;
    }
    await route.fulfill(jsonResponse(200, { connections: [] }));
  });
}

/** GET /api/v1/connections — deterministic 503. */
export async function routeConnectionsWithServerError(page: Page): Promise<void> {
  await page.route(CONNECTIONS_ROUTE, async (route) => {
    if (!isGet(route)) {
      await route.continue();
      return;
    }
    await route.fulfill(jsonResponse(503, { error: 'Service unavailable' }));
  });
}

/** Example mock child id for stubbed create responses (ignored by the cleanup fixture). */
export function mockChildId(suffix = '001'): string {
  return `${MOCK_RECORD_ID_PREFIX}child-${suffix}`;
}
