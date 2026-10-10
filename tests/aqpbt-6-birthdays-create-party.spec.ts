import type { Page } from '@playwright/test';

import { BirthdayPartyManagePage } from '../pages/birthday-party-manage.page';
import { BirthdaysPage } from '../pages/birthdays.page';
import { test, expect } from '../fixtures/cleanup.fixture';
import { AppRoute } from '../test-data/routes';

const birthdaysUrlPattern = new RegExp(`${AppRoute.Birthdays}(\\?.*)?$`);
const partyUrlPattern = new RegExp(`${AppRoute.Birthdays}/[0-9a-f-]{36}(\\?.*)?$`);
const calendarUrlPattern = new RegExp(`${AppRoute.Calendar}(\\?.*)?$`);

const createdStatusText =
  'Party created, but email is off right now — share the RSVP link.';
const cancelConfirmMessage = 'Cancel this party? Guests who left an email will be told.';
const requiredFieldMessage = 'Please fill out this field.';

const circleInvitees = ['Ethan The Nguyens', 'Sofia The Petrovs'] as const;
const mapleClassInvitee = 'Zara The Ahmeds';
const cardThemes = [
  'No card',
  'Balloons',
  'Birthday cake',
  'Dinosaur',
  'Space',
  'Under the sea',
  'Rainbow',
] as const;

test.describe('AQPBT-6 Birthdays — create party', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    const birthdays = new BirthdaysPage(page);
    await birthdays.goto();
    await cancelActiveBirthdayParties(page);
    await birthdays.goto();
    await expect(birthdays.partiesLoading).toBeHidden();
  });

  test('birthdays banner and create form are visible', { tag: '@regression' }, async ({ page }) => {
    const birthdays = new BirthdaysPage(page);

    await expect(page).toHaveURL(birthdaysUrlPattern);
    await expect(birthdays.birthdaysBanner).toBeVisible();
    await expect(birthdays.createPartyTitle).toBeVisible();
  });

  test('empty upcoming list shows no parties yet', { tag: '@regression' }, async ({ page }) => {
    const birthdays = new BirthdaysPage(page);

    await expect(page).toHaveURL(birthdaysUrlPattern);
    await expect(birthdays.emptyPartiesMessage).toBeVisible();
  });

  test('whose birthday lists Mia and Maria', { tag: '@regression' }, async ({ page }) => {
    const form = new BirthdaysPage(page).createPartyForm;

    await expect(form.birthdayChildCombobox).toContainText('Whose birthday? (optional)');
    await expect(form.birthdayChildCombobox).toContainText('Mia');
    await expect(form.birthdayChildCombobox).toContainText('Maria');
  });

  test('invite children explains the RSVP email', { tag: '@regression' }, async ({ page }) => {
    const form = new BirthdaysPage(page).createPartyForm;

    await expect(form.inviteChildrenGroup).toBeVisible();
    await expect(form.inviteHelperText).toBeVisible();
  });

  test('circle and Maple Class children are invite checkboxes', { tag: '@regression' }, async ({ page }) => {
    const form = new BirthdaysPage(page).createPartyForm;

    for (const name of circleInvitees) {
      await expect(form.yourCircleInvites.getByRole('checkbox', { name, exact: true })).toBeVisible();
    }
    await expect(
      form.mapleClassInvites.getByRole('checkbox', { name: mapleClassInvitee, exact: true }),
    ).toBeVisible();
  });

  test('party details fields are shown', { tag: '@regression' }, async ({ page }) => {
    const form = new BirthdaysPage(page).createPartyForm;

    await expect(form.partyTitleInput).toBeVisible();
    await expect(form.dateTimeInput).toBeVisible();
    await expect(form.venueInput).toBeVisible();
    await expect(form.detailsInput).toBeVisible();
  });

  test('invitation card themes are available', { tag: '@regression' }, async ({ page }) => {
    const form = new BirthdaysPage(page).createPartyForm;

    await expect(form.invitationCardGroup).toBeVisible();
    for (const theme of cardThemes) {
      await expect(form.invitationCard(theme)).toBeVisible();
    }
  });

  test('empty create party stays on birthdays', { tag: '@regression' }, async ({ page }) => {
    const form = new BirthdaysPage(page).createPartyForm;

    await form.submit();

    await expect(page).toHaveURL(birthdaysUrlPattern);
    await expect(form.partyTitleInput).toHaveJSProperty('validationMessage', requiredFieldMessage);
  });

  test('leaving the form does not create a party', { tag: '@regression' }, async ({ page }) => {
    const birthdays = new BirthdaysPage(page);

    await birthdays.createPartyForm.selectInvitationCard('Dinosaur');
    await birthdays.createPartyForm.toggleInvitee(circleInvitees[0]);
    await birthdays.header.goToCalendar();
    await expect(page).toHaveURL(calendarUrlPattern);

    await birthdays.goto();
    await expect(birthdays.emptyPartiesMessage).toBeVisible();
  });

  test('create party lists the invitation and email-off status', { tag: '@regression' }, async ({ page }) => {
    const title = uniquePartyTitle();
    let partyId = '';
    try {
      partyId = await createInvitedParty(page, title);
      const birthdays = new BirthdaysPage(page);

      await expect(page).toHaveURL(birthdaysUrlPattern);
      await expect(birthdays.createdStatus).toHaveText(createdStatusText);
      await expect(birthdays.upcomingPartyCard(title)).toBeVisible();
      await expect(birthdays.upcomingPartyCard(title).getByRole('link', { name: 'Manage →' })).toBeVisible();
    } finally {
      await cancelParty(page, partyId);
    }
  });

  test('manage screen shows guest link tools and empty RSVPs', { tag: '@regression' }, async ({ page }) => {
    const title = uniquePartyTitle();
    let partyId = '';
    try {
      partyId = await createInvitedParty(page, title);
      const birthdays = new BirthdaysPage(page);
      const manage = new BirthdayPartyManagePage(page);

      await birthdays.openManage(title);

      await expect(page).toHaveURL(partyUrlPattern);
      await expect(manage.birthdaysBanner).toBeVisible();
      await expect(manage.partyTitle(title)).toBeVisible();
      await expect(manage.editButton).toBeVisible();
      await expect(manage.copyButton).toBeVisible();
      await expect(manage.cancelPartyButton).toBeVisible();
      await expect(manage.addToCalendarLink).toBeVisible();
      await expect(manage.sendInvitesButton).toBeVisible();
      await expect(manage.emptyRsvpsMessage).toBeVisible();
    } finally {
      await cancelParty(page, partyId);
    }
  });

  test('manage screen shows the guest link and invite-by-email copy', { tag: '@regression' }, async ({ page }) => {
    const title = uniquePartyTitle();
    let partyId = '';
    try {
      partyId = await createInvitedParty(page, title);
      const manage = new BirthdayPartyManagePage(page);

      await manage.goto(partyId);

      await expect(manage.guestLinkLabel).toBeVisible();
      await expect(manage.inviteByEmail).toBeVisible();
      await expect(manage.inviteEmailHelper).toBeVisible();
    } finally {
      await cancelParty(page, partyId);
    }
  });

  test('upcoming card shows manage and RSVP link', { tag: '@regression' }, async ({ page }) => {
    const title = uniquePartyTitle();
    let partyId = '';
    try {
      partyId = await createInvitedParty(page, title);
      const birthdays = new BirthdaysPage(page);
      const card = birthdays.upcomingPartyCard(title);

      await expect(card.getByRole('link', { name: 'Manage →' })).toBeVisible();
      await expect(card.getByRole('button', { name: 'copy RSVP link' })).toBeVisible();
    } finally {
      await cancelParty(page, partyId);
    }
  });

  test('edit shows save, discard, and party fields', { tag: '@regression' }, async ({ page }) => {
    const title = uniquePartyTitle();
    let partyId = '';
    try {
      partyId = await createInvitedParty(page, title);
      const manage = new BirthdayPartyManagePage(page);

      await manage.goto(partyId);
      await manage.edit();

      await expect(manage.saveChangesButton).toBeVisible();
      await expect(manage.discardButton).toBeVisible();
      await expect(manage.dateTimeInput).toBeVisible();
      await expect(manage.titleInput).toBeVisible();
      await expect(manage.venueInput).toBeVisible();
      await expect(manage.detailsInput).toBeVisible();
    } finally {
      await cancelParty(page, partyId);
    }
  });

  test('discard edit stays on the party', { tag: '@regression' }, async ({ page }) => {
    const title = uniquePartyTitle();
    let partyId = '';
    try {
      partyId = await createInvitedParty(page, title);
      const manage = new BirthdayPartyManagePage(page);

      await manage.goto(partyId);
      await manage.edit();
      await manage.discard();

      await expect(page).toHaveURL(partyUrlPattern);
      await expect(manage.editButton).toBeVisible();
      await expect(manage.saveChangesButton).toHaveCount(0);
    } finally {
      await cancelParty(page, partyId);
    }
  });

  test('dismissing cancel party leaves the party open', { tag: '@regression' }, async ({ page }) => {
    const title = uniquePartyTitle();
    let partyId = '';
    try {
      partyId = await createInvitedParty(page, title);
      const manage = new BirthdayPartyManagePage(page);
      let dialogMessage = '';

      await manage.goto(partyId);
      page.once('dialog', async (dialog) => {
        dialogMessage = dialog.message();
        await dialog.dismiss();
      });
      await manage.requestCancel();

      await expect.poll(() => dialogMessage).toBe(cancelConfirmMessage);
      await expect(page).toHaveURL(partyUrlPattern);
      await expect(manage.cancelPartyButton).toBeVisible();
    } finally {
      await cancelParty(page, partyId);
    }
  });
});

function uniquePartyTitle(): string {
  return `AQPBT-6 ${Date.now()}`;
}

/** Local datetime-local value about forty days ahead in America/Toronto. */
function futureDateTimeLocal(): string {
  const when = new Date(Date.now() + 40 * 24 * 60 * 60 * 1000);
  const formatted = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Toronto',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(when);
  const match = formatted.match(/(\d{4})-(\d{2})-(\d{2})[^\d]+(\d{2}):(\d{2})/);
  if (!match) {
    throw new Error(`Could not format a future party date from ${formatted}`);
  }
  return `${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}`;
}

/**
 * Creates a party the way exploration did: one circle invitee, title, future date, Dinosaur card.
 * @param page — signed-in Birthdays page
 * @param title — unique party title
 */
async function createInvitedParty(page: Page, title: string): Promise<string> {
  const birthdays = new BirthdaysPage(page);
  await birthdays.createPartyForm.toggleInvitee(circleInvitees[0]);
  await birthdays.createPartyForm.fillTitle(title);
  await birthdays.createPartyForm.fillDateTime(futureDateTimeLocal());
  await birthdays.createPartyForm.selectInvitationCard('Dinosaur');
  return birthdays.createPartyForm.submitAndReadId();
}

type BirthdayEventRow = {
  id?: string;
  status?: string;
  kind?: string;
};

/** Cancels active birthday events so empty-list scenarios can start from no upcoming parties. */
async function cancelActiveBirthdayParties(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const token = localStorage.getItem('bt_token');
    if (!token) return;
    const response = await fetch('/api/v1/events', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const events = (await response.json()) as BirthdayEventRow[];
    for (const event of events) {
      if (event.status !== 'active' || event.kind !== 'birthday' || !event.id) continue;
      await fetch(`/api/v1/events/${event.id}/cancel`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    }
  });
}

/**
 * Cancels one party this spec created. No-op when create never returned an id.
 * @param page — signed-in page on the app origin
 * @param partyId — event id from create, or empty
 */
async function cancelParty(page: Page, partyId: string): Promise<void> {
  if (!partyId) return;
  await page.evaluate(async (id) => {
    const token = localStorage.getItem('bt_token');
    if (!token) return;
    await fetch(`/api/v1/events/${id}/cancel`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
  }, partyId);
}
