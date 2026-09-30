import type { LoginCredentials } from './factories/login-credentials.factory';

/**
 * Invalid log-in field values fixed by AQPBT-1 acceptance criteria.
 *
 * AC3 (valid email + incorrect password): story does not define the password literal —
 * use `buildWrongPasswordLoginAttempt()` in tests.
 *
 * AC4 (unregistered email + any password): story does not define the email literal —
 * use `buildUnregisteredUserLoginAttempt()` in tests.
 */
export const invalidLoginInputs = {
  /** AC5: Given I am on `/login`, When I click Log in without filling Email and Password, Then I remain on `/login` and do not see Invalid email or password. */
  emptyFields: {
    email: '',
    password: '',
  } satisfies LoginCredentials,
} as const;

/**
 * Open questions (AQPBT-1 + Confluence [Vitaly] Log in):
 * - Malformed Email (HTML5 `type=email` messages) — not specified in AC3–5; observed e.g. missing `@` blocks submit without **Invalid email or password**.
 * - AC3: whether any non-matching password qualifies or a specific incorrect value is required.
 * - AC4: whether any non-registered address qualifies or particular domains/formats are rejected before **Invalid email or password**.
 */
