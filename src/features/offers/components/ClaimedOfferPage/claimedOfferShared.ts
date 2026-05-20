import type { PaymentMethod } from "@/features/offers/offers.types"

export const ROW_ICON_CLASS = "shrink-0 text-action-primary"

export const SEMIBOLD = {
  fontVariationSettings: "'wght' var(--font-weight-semibold)",
} as const

/** Figma `static/content/primary-light` on `bg-special-brand-alt` hero. */
export const HERO_ON_DARK_TEXT_STYLE = {
  color: "var(--color-static-content-primary-light)",
} as const

/** Figma claimed-offer details row — e.g. "30% discount on food" (`16123:18340`). */
export function formatClaimedOfferFoodLabel(discountPercent: number): string {
  return `${discountPercent}% discount on food`
}

/** Pay footer subtitle (Figma `16123:18340`). */
export function formatClaimedOfferDiscountSubtitle(discountPercent: number): string {
  return `${discountPercent}% discount`
}

export function formatClaimedOfferPaymentLabel(paymentMethod: PaymentMethod): string {
  return paymentMethod === "dineout" ?
      "Paying with Bolt DineOut"
    : "Paying by card or cash"
}

export function formatWelcomeAtRestaurant(restaurantName: string): string {
  return `Welcome at ${restaurantName}`
}

/** Figma claimed-offer details row — singular/plural-safe guest count. */
export function formatGuestCountLabel(guestCount: number): string {
  return guestCount === 1 ? "1 guest" : `${guestCount} guests`
}
