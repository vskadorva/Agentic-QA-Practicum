import { faker } from '@faker-js/faker';

/** Payload for the `/login` form (**Email**, **Password**); both fields are required in the app. */
export type LoginCredentials = {
  email: string;
  password: string;
};

/** Family A log-in payload from `APP_USER_EMAIL` / `APP_USER_PASSWORD`. */
export function buildFamilyALoginCredentials(): LoginCredentials {
  return {
    email: process.env.APP_USER_EMAIL!,
    password: process.env.APP_USER_PASSWORD!,
  };
}

/** Family B log-in payload from `APP_ALT_USER_EMAIL` / `APP_ALT_USER_PASSWORD`. */
export function buildFamilyBLoginCredentials(): LoginCredentials {
  return {
    email: process.env.APP_ALT_USER_EMAIL!,
    password: process.env.APP_ALT_USER_PASSWORD!,
  };
}

/** Unique email-shaped value for accounts that should not exist in BuddyTime (AQPBT-1 AC4). */
export function buildUnregisteredLoginEmail(): string {
  return `qa-unregistered-${Date.now()}.${faker.string.alphanumeric(8).toLowerCase()}@example.com`;
}

/** Unique password string that should not match a registered account (AQPBT-1 AC3). */
export function buildIncorrectLoginPassword(): string {
  return `WrongPass-${Date.now()}-${faker.string.alphanumeric(6)}!`;
}

/** Registered Family A email with a non-matching password (AQPBT-1 AC3). */
export function buildWrongPasswordLoginAttempt(): LoginCredentials {
  return {
    email: process.env.APP_USER_EMAIL!,
    password: buildIncorrectLoginPassword(),
  };
}

/** Unregistered email with an arbitrary password (AQPBT-1 AC4). */
export function buildUnregisteredUserLoginAttempt(): LoginCredentials {
  return {
    email: buildUnregisteredLoginEmail(),
    password: buildIncorrectLoginPassword(),
  };
}
