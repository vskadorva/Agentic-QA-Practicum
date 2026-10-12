/**
 * Invalid and boundary sign-up values fixed by AQPBT-4.
 * Family A email and password stay in `buildFamilyALoginCredentials()`.
 */
export const invalidSignUpInputs = {
  /** Filled Your name on validation and duplicate scenarios. */
  parentName: 'Lev',
  /** AC5 / AC7: shorter than the 8-character minimum. */
  sevenCharacterPassword: '1234567',
  /** AC9 and email checks: long enough for the browser to accept and the server to answer. */
  eightCharacterPassword: '12345678',
  /** AC4 / AC6. */
  notAnEmail: 'not-an-email',
  /** AC16. */
  missingAt: 'missing-at.com',
  /** AC17. */
  userAt: 'user@',
  /** AC18. */
  atExample: '@example.com',
  /** AC19. */
  spaceBeforeAt: 'spaces @example.com',
  /** AC20. */
  dotWrongPosition: 'user@.com',
  /** Confluence rule 6: three spaces. */
  spacesOnlyName: '   ',
} as const;

/** Browser validation sentences from AQPBT-4 (locale en-CA). */
export const signUpValidationMessages = {
  requiredField: 'Please fill out this field.',
  missingAtNotAnEmail:
    "Please include an '@' in the email address. 'not-an-email' is missing an '@'.",
  missingAtDotCom:
    "Please include an '@' in the email address. 'missing-at.com' is missing an '@'.",
  incompleteAfterAt: "Please enter a part following '@'. 'user@' is incomplete.",
  incompleteBeforeAt: "Please enter a part followed by '@'. '@example.com' is incomplete.",
  spaceBeforeAt: "A part followed by '@' should not contain the symbol ' '.",
  dotWrongPosition: "'.' is used at a wrong position in '.com'.",
  passwordTooShort:
    'Please lengthen this text to 8 characters or more (you are currently using 7 characters).',
} as const;
