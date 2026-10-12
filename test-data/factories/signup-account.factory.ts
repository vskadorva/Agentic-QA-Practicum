import { buildUnregisteredLoginEmail } from './login-credentials.factory';

/** Your name maxlength on Create your account (AQPBT-4 AC8). */
export const signUpYourNameMaxLength = 100;

/** Parent account created by an AQPBT-4 sign-up scenario. */
export type SignUpAccount = {
  name: string;
  email: string;
  password: string;
};

/**
 * Unique sign-up account.
 * Email domain matches `buildUnregisteredLoginEmail` (`@example.com`).
 * Your name is `Signup Parent` plus `Date.now()` and stays under 100 characters.
 */
export function buildUniqueSignUpAccount(): SignUpAccount {
  const stamp = Date.now();
  return {
    name: `Signup Parent ${stamp}`,
    email: buildUnregisteredLoginEmail(),
    password: `Signup-${stamp}`,
  };
}

/**
 * Repeats `a` for AQPBT-4 name-length checks.
 * @param length Number of `a` characters.
 */
export function buildYourNameOfLength(length: number): string {
  return 'a'.repeat(length);
}

/**
 * Swaps the case of every letter and leaves non-letters unchanged (AQPBT-4 AC22–AC23).
 * @param value Email or other text to case-swap.
 */
export function swapLetterCase(value: string): string {
  return Array.from(value, (character) => {
    const upper = character.toUpperCase();
    const lower = character.toLowerCase();
    if (upper === lower) {
      return character;
    }
    return character === lower ? upper : lower;
  }).join('');
}
