/** Anonymous GET status recorded in api/CATALOG.md (§ Unauthenticated GET responses). */
export const UNAUTHENTICATED_GET_STATUS = 401;

/** DELETE child without token (api/CATALOG.md § Authorization). */
export const UNAUTHENTICATED_DELETE_CHILD_STATUS = 401;

/** DELETE another family's child id (api/CATALOG.md § Authorization). */
export const UNAUTHORIZED_DELETE_CHILD_STATUS = 404;

/** Matches query param observed on Playdates page (api/CATALOG.md). */
export const MATCHES_DAYS_QUERY = 21;
