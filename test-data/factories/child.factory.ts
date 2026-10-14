/** Payload for `POST /api/v1/children` (see api/CATALOG.md). */
export interface CreateChildPayload {
  firstName: string;
  birthYear: number;
  birthMonth: number;
  gender: string;
  interests: string[];
}

/** Unique disposable child for API tests. */
export function buildCreateChildPayload(): CreateChildPayload {
  return {
    firstName: `Api${Date.now()}`,
    birthYear: 2019,
    birthMonth: 4,
    gender: 'girl',
    interests: [],
  };
}
