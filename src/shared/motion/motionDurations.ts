/** Full-screen push (detail, search, pay stack, claimed offer). ~Apple page transition. */
export const MOTION_PUSH_S = 0.42

/** Bottom sheet present. */
export const MOTION_SHEET_S = 0.32

/** Bottom sheet dismiss (slightly faster than enter). */
export const MOTION_SHEET_DISMISS_S = 0.24

/** In-page tab panel slide, venue bar, staggered blocks. */
export const MOTION_IN_PAGE_S = 0.35

/** Micro reveals, tab underline, snackbar. */
export const MOTION_MICRO_S = 0.2

/** Standard dim behind bottom sheets. */
export const MOTION_SCRIM_MAX = 0.28

/** Light dim behind horizontal push (restaurant detail). */
export const MOTION_DETAIL_SCRIM = 0.15

/** Instant settle when reduced motion is on. */
export const MOTION_REDUCED_S = 0.12

/** Delay before at-venue bar entrance after panel push starts. */
export const MOTION_VENUE_BAR_DELAY_S = MOTION_PUSH_S * 0.25

/** Drag dismiss thresholds (bottom sheets). */
export const MOTION_SHEET_DISMISS_DRAG_PX = 80
export const MOTION_SHEET_DISMISS_VELOCITY = 500
