import { expect } from '@playwright/test';

export function expectJsonContentType(contentType: string | undefined): void {
  expect(contentType ?? '').toContain('application/json');
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function expectStringField(obj: Record<string, unknown>, key: string): void {
  expect(typeof obj[key]).toBe('string');
}

function expectNullableStringField(obj: Record<string, unknown>, key: string): void {
  const value = obj[key];
  expect(value === null || typeof value === 'string').toBeTruthy();
}

function expectBooleanField(obj: Record<string, unknown>, key: string): void {
  expect(typeof obj[key]).toBe('boolean');
}

function expectNumberField(obj: Record<string, unknown>, key: string): void {
  expect(typeof obj[key]).toBe('number');
}

function expectFamilyIdName(obj: Record<string, unknown>): void {
  expectStringField(obj, 'id');
  expectStringField(obj, 'name');
}

/** `GET /api/v1/me` body (api/CATALOG.md). */
export function assertMeBody(body: unknown): void {
  expect(isRecord(body)).toBeTruthy();
  if (!isRecord(body)) return;

  expect(isRecord(body.parent)).toBeTruthy();
  expect(isRecord(body.family)).toBeTruthy();
  expectBooleanField(body, 'isAdmin');

  const parent = body.parent as Record<string, unknown>;
  expectStringField(parent, 'id');
  expectStringField(parent, 'email');
  expectStringField(parent, 'name');
  expectStringField(parent, 'displayName');
  expectNullableStringField(parent, 'phone');
  expectBooleanField(parent, 'emailVerified');

  const family = body.family as Record<string, unknown>;
  expectStringField(family, 'id');
  expectStringField(family, 'name');
  expectNullableStringField(family, 'addressText');
  expectStringField(family, 'addressVisibility');
  expectStringField(family, 'tz');
  expect(Array.isArray(family.parents)).toBeTruthy();
  expect(Array.isArray(family.children)).toBeTruthy();
}

/** One connection element from `GET /api/v1/connections`. */
export function assertConnectionItem(item: unknown): void {
  expect(isRecord(item)).toBeTruthy();
  if (!isRecord(item)) return;

  expectStringField(item, 'id');
  expect(isRecord(item.family)).toBeTruthy();
  if (isRecord(item.family)) expectFamilyIdName(item.family);
  expect(Array.isArray(item.children)).toBeTruthy();
  expect(Array.isArray(item.communities)).toBeTruthy();
  expectStringField(item, 'since');
  expectStringField(item, 'status');
  expectBooleanField(item, 'blockedByMe');
}

/** `GET /api/v1/availability` body. */
export function assertAvailabilityBody(body: unknown): void {
  expect(isRecord(body)).toBeTruthy();
  if (!isRecord(body)) return;

  expect(Array.isArray(body.rules)).toBeTruthy();
  expect(Array.isArray(body.exceptions)).toBeTruthy();

  const rules = body.rules as unknown[];
  if (rules.length > 0) {
    const rule = rules[0];
    expect(isRecord(rule)).toBeTruthy();
    if (!isRecord(rule)) return;
    expectStringField(rule, 'id');
    expect(rule.childId === null || typeof rule.childId === 'string').toBeTruthy();
    expectNumberField(rule, 'weekday');
    expectNumberField(rule, 'startMin');
    expectNumberField(rule, 'endMin');
    expectStringField(rule, 'hosting');
    expectNumberField(rule, 'noticeHours');
  }

  const exceptions = body.exceptions as unknown[];
  if (exceptions.length > 0) {
    const ex = exceptions[0];
    expect(isRecord(ex)).toBeTruthy();
    if (!isRecord(ex)) return;
    expectStringField(ex, 'id');
    expectStringField(ex, 'date');
    expectStringField(ex, 'kind');
    expectNumberField(ex, 'startMin');
    expectNumberField(ex, 'endMin');
    expectStringField(ex, 'note');
  }
}

/** One playdate from `GET /api/v1/playdates` or filtered list. */
export function assertPlaydateItem(item: unknown): void {
  expect(isRecord(item)).toBeTruthy();
  if (!isRecord(item)) return;

  expectStringField(item, 'id');
  expectStringField(item, 'status');
  expectStringField(item, 'startsAt');
  expectStringField(item, 'endsAt');
  expectStringField(item, 'locationKind');
  expectNullableStringField(item, 'locationText');
  expectNullableStringField(item, 'notes');
  for (const key of [
    'proposerFamily',
    'inviteeFamily',
    'otherFamily',
    'hostFamily',
  ] as const) {
    expect(isRecord(item[key])).toBeTruthy();
    if (isRecord(item[key])) expectFamilyIdName(item[key]);
  }
  expect(Array.isArray(item.children)).toBeTruthy();
  expect(isRecord(item.proposedBy)).toBeTruthy();
  if (isRecord(item.proposedBy)) {
    expectStringField(item.proposedBy, 'id');
    expectStringField(item.proposedBy, 'name');
    expectStringField(item.proposedBy, 'displayName');
  }
  expectNullableStringField(item, 'respondedAt');
  expectNullableStringField(item, 'cancelledAt');
  expectStringField(item, 'googleCalendarUrl');
  expectStringField(item, 'icsUrl');
  expectBooleanField(item, 'canRespond');
  expectBooleanField(item, 'canCancel');
}

/** One match slot from `GET /api/v1/matches?days={n}`. */
export function assertMatchItem(item: unknown): void {
  expect(isRecord(item)).toBeTruthy();
  if (!isRecord(item)) return;

  expectStringField(item, 'date');
  expectNumberField(item, 'startMin');
  expectNumberField(item, 'endMin');
  expectStringField(item, 'startsAt');
  expectStringField(item, 'endsAt');
  expect(isRecord(item.family)).toBeTruthy();
  if (isRecord(item.family)) expectFamilyIdName(item.family);
  const host = item.suggestedHost;
  expect(host === null || isRecord(host)).toBeTruthy();
  if (isRecord(host)) expectFamilyIdName(host);
  expectStringField(item, 'locationKind');
}

/** One community from `GET /api/v1/communities`. */
export function assertCommunityListItem(item: unknown): void {
  expect(isRecord(item)).toBeTruthy();
  if (!isRecord(item)) return;

  expectStringField(item, 'id');
  expectStringField(item, 'name');
  expectStringField(item, 'type');
  expectStringField(item, 'description');
  expectStringField(item, 'myRole');
  expectStringField(item, 'myStatus');
  expectNumberField(item, 'familiesCount');
  expectNumberField(item, 'pendingCount');
  expectStringField(item, 'createdAt');
}

/** `GET /api/v1/communities/{id}` body. */
export function assertCommunityDetailBody(body: unknown): void {
  assertCommunityListItem(body);
  if (!isRecord(body)) return;

  expect(Array.isArray(body.members)).toBeTruthy();
  const members = body.members as unknown[];
  if (members.length > 0) {
    const member = members[0];
    expect(isRecord(member)).toBeTruthy();
    if (!isRecord(member)) return;
    expectStringField(member, 'id');
    expect(isRecord(member.family)).toBeTruthy();
    expectStringField(member, 'role');
    expectStringField(member, 'status');
    expect(Array.isArray(member.children)).toBeTruthy();
    expect(member.connection === null || isRecord(member.connection)).toBeTruthy();
    expectStringField(member, 'since');
  }
}

/** One event from `GET /api/v1/events`. */
export function assertEventItem(item: unknown): void {
  expect(isRecord(item)).toBeTruthy();
  if (!isRecord(item)) return;

  expectStringField(item, 'id');
  expectStringField(item, 'kind');
  expectStringField(item, 'title');
  expectNullableStringField(item, 'childId');
  expectNullableStringField(item, 'childName');
  expectStringField(item, 'startsAt');
  expectNullableStringField(item, 'endsAt');
  expectNullableStringField(item, 'venueText');
  expectNullableStringField(item, 'details');
  expectStringField(item, 'cardKey');
  expectStringField(item, 'status');
  expectNullableStringField(item, 'communityId');
  expectNullableStringField(item, 'communityName');
  expectStringField(item, 'rsvpToken');
  expect(isRecord(item.counts)).toBeTruthy();
  if (isRecord(item.counts)) {
    expectNumberField(item.counts, 'yes');
    expectNumberField(item.counts, 'no');
    expectNumberField(item.counts, 'maybe');
    expectNumberField(item.counts, 'guestsComing');
  }
  expectStringField(item, 'createdAt');
  expectBooleanField(item, 'canManage');
}

/** `POST /api/v1/children` 201 body. */
export function assertCreatedChildBody(body: unknown): void {
  expect(isRecord(body)).toBeTruthy();
  if (!isRecord(body)) return;

  expectStringField(body, 'id');
  expectStringField(body, 'firstName');
  expectNumberField(body, 'birthYear');
  expectNumberField(body, 'birthMonth');
  expectNumberField(body, 'age');
  expectStringField(body, 'gender');
  expect(Array.isArray(body.interests)).toBeTruthy();
  expect(body.avatarKey === null || typeof body.avatarKey === 'string').toBeTruthy();
}
