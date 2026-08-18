/** Full-screen push (detail, search, pay stack, claimed offer). ~Apple page transition. */
export const MOTION_PUSH_S = 0.5

/** Bottom sheet present (~UISheetPresentationController, ~500ms). */
export const MOTION_SHEET_S = 0.5

/** Bottom sheet dismiss — slightly quicker than present, still iOS-paced. */
export const MOTION_SHEET_DISMISS_S = 0.45

/** In-page tab panel slide, staggered blocks. */
export const MOTION_IN_PAGE_S = 0.35

/** Micro reveals, tab underline. */
export const MOTION_MICRO_S = 0.2

/**
 * Snackbar / toast present — short transient banner (iOS HIG: fluid, decelerating enter).
 */
export const MOTION_SNACKBAR_ENTER_S = 0.28

/**
 * Snackbar dismiss — quicker than enter (iOS HIG: exits accelerate out of view).
 */
export const MOTION_SNACKBAR_EXIT_S = 0.2

/** Standard dim behind bottom sheets. */
export const MOTION_SCRIM_MAX = 0.28

/** Light dim behind horizontal push (restaurant detail). */
export const MOTION_DETAIL_SCRIM = 0.15

/** Instant settle when reduced motion is on. */
export const MOTION_REDUCED_S = 0.12

/**
 * Breathing room after one sheet finishes dismissing before the next presents.
 * Matches iOS sequential modal presentation (HIG: avoid stacking transitions).
 */
export const MOTION_SHEET_SEQUENTIAL_GAP_S = 0.16

/**
 * After check-in PIN card dismisses, wait before enabling the Pay bill section.
 */
export const MOTION_CHECK_IN_TO_PAY_DELAY_S = 0.4

/** Drag dismiss thresholds (bottom sheets). */
export const MOTION_SHEET_DISMISS_DRAG_PX = 80
export const MOTION_SHEET_DISMISS_VELOCITY = 500
