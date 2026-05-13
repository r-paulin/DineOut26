/**
 * Shared layout for Vaul drawer close pills (absolute top-right, 32×32 hit target).
 */
const SHEET_CLOSE_LAYOUT =
  "absolute right-2 top-2 inline-flex size-8 items-center justify-center rounded-full p-0 shadow-none outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-action-primary rtl:left-2 rtl:right-auto"

/**
 * Close control when it sits over **plain sheet chrome** (no hero photo behind it).
 * Grey surface + primary icon — matches pre-frost treatment for list-only sheets.
 */
export const SHEET_CLOSE_ON_SURFACE_CLASS =
  `${SHEET_CLOSE_LAYOUT} z-[2] border-0 bg-neutral-secondary hover:bg-active-neutral-secondary`

export const SHEET_CLOSE_ON_SURFACE_NESTED_CLASS =
  `${SHEET_CLOSE_LAYOUT} z-[1] border-0 bg-neutral-secondary hover:bg-active-neutral-secondary`

/**
 * Close control when it overlaps a **hero image** at the top of the sheet.
 * Solid light surface + dark icon (same family as {@link DineOutPromoSheet} hero close).
 */
export const SHEET_CLOSE_OVER_MEDIA_CLASS =
  `${SHEET_CLOSE_LAYOUT} z-[2] border-0 bg-static-key-light shadow-[0_0.125rem_0.375rem_rgba(0,0,0,0.16)] hover:bg-active-neutral-secondary`

export const SHEET_CLOSE_OVER_MEDIA_NESTED_CLASS =
  `${SHEET_CLOSE_LAYOUT} z-[1] border-0 bg-static-key-light shadow-[0_0.125rem_0.375rem_rgba(0,0,0,0.16)] hover:bg-active-neutral-secondary`

export const SHEET_CLOSE_ICON_ON_SURFACE_CLASS = "text-primary shrink-0"

export const SHEET_CLOSE_ICON_OVER_MEDIA_CLASS = "text-static-key-dark shrink-0"
