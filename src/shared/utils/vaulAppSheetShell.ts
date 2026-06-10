/**
 * Shared Vaul bottom-sheet chrome (matches {@link RestaurantRatingSheet} /
 * {@link RestaurantOpenHoursSheet}): scrim token, 16px top radius, shadow, max-height.
 */

export const VAUL_SHEET_OVERLAY_CLASS = "fixed inset-0 bg-special-scrim"

export type VaulSheetMaxHeightVariant = "default" | "nested"

/** Caps sheet height using app viewport (Firefox-friendly `dvh` + device shell `--app-h`). */
export const VAUL_SHEET_MAX_HEIGHT_CLASS =
  "max-h-[min(97dvh,var(--app-h,100dvh))]"

export const VAUL_SHEET_MAX_HEIGHT_NESTED_CLASS =
  "max-h-[min(85dvh,calc(var(--app-h,100dvh)*0.85))]"

/** Scrollable body between hero and optional pinned footer. */
export const VAUL_SHEET_SCROLL_BODY_CLASS =
  "min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-y-contain"

/** Pinned footer CTA row (outside scroll). */
export const VAUL_SHEET_FOOTER_CLASS =
  "shrink-0 border-t border-separator bg-layer-floor-1 px-6 pb-[max(1.5rem,var(--safe-area-bottom))] pt-3"

export type VaulSheetLayout = "fit" | "fill"

/** `nested` = shorter cap for pickers nested inside another modal (claim flow). */
export function vaulSheetContentClassName(
  variant: VaulSheetMaxHeightVariant = "default",
  layout: VaulSheetLayout = "fit",
): string {
  const maxH =
    variant === "nested" ? VAUL_SHEET_MAX_HEIGHT_NESTED_CLASS : VAUL_SHEET_MAX_HEIGHT_CLASS
  const layoutClass =
    layout === "fill" ?
      "flex min-h-0 flex-col overflow-hidden"
    : "flex h-fit flex-col overflow-hidden"
  return [
    "fixed bottom-0 left-0 right-0 outline-none",
    maxH,
    layoutClass,
    "rounded-t-[16px] bg-layer-floor-1",
    "shadow-[0_0.375rem_0.75rem_rgba(0,0,0,0.24)]",
  ].join(" ")
}
