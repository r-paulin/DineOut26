/**
 * Stacking for restaurant flows. About is in-panel (no dedicated overlay z-index).
 * Sheets and menu gallery portal above the detail shell.
 */
export const Z_RESTAURANT_SHEET_OVERLAY = 1400
export const Z_RESTAURANT_SHEET_CONTENT = 1401

/** Claimed offer full-screen page (above restaurant sheets / about). */
export const Z_CLAIMED_OFFER_PAGE = 1500
/** Claim offer full-screen modal. */
export const Z_CLAIM_MODAL_OVERLAY = 1600
export const Z_CLAIM_MODAL_CONTENT = 1601
/** Nested pickers opened from claim modal (above claim modal chrome). */
export const Z_CLAIM_NESTED_SHEET_OVERLAY = 1700
export const Z_CLAIM_NESTED_SHEET_CONTENT = 1701

/**
 * Standalone arrival-time sheet above discover/search fullscreen (`z-[120]`) and
 * the map FAB (`z-[125]`).
 */
export const Z_SEARCH_OPEN_AT_OVERLAY = 126
export const Z_SEARCH_OPEN_AT_CONTENT = 127
