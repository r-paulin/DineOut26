/**
 * Shared Vaul bottom-sheet chrome (matches {@link RestaurantRatingSheet} /
 * {@link RestaurantOpenHoursSheet}): scrim token, 16px top radius, shadow, max-height.
 */

export const VAUL_SHEET_OVERLAY_CLASS = "fixed inset-0 bg-special-scrim"

export type VaulSheetMaxHeightVariant = "default" | "nested"

/** `nested` = shorter cap for pickers nested inside another modal (claim flow). */
export function vaulSheetContentClassName(
  variant: VaulSheetMaxHeightVariant = "default",
): string {
  const maxH =
    variant === "nested" ? "max-h-[85vh]"
    : "max-h-[97vh]"
  return [
    "fixed bottom-0 left-0 right-0 h-fit outline-none",
    maxH,
    "rounded-t-[16px] overflow-hidden bg-layer-floor-1",
    "shadow-[0_0.375rem_0.75rem_rgba(0,0,0,0.24)]",
  ].join(" ")
}
