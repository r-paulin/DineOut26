import type { PaymentMethod } from "@/features/offers/offers.types"
import { CLAIMED_OFFER_PAYMENT_LABELS } from "@/features/offers/components/paymentMethod/DineOutCashbackBannerSlot"
import { formatOfferDiscountTitle } from "@/features/offers/utils/formatOfferDiscountTitle"

export const ROW_ICON_CLASS = "shrink-0 text-neutral-primary"

export const SEMIBOLD = {
  fontVariationSettings: "'wght' var(--font-weight-semibold)",
} as const

/** Figma `static/content/primary-light` on `bg-special-brand-alt` hero. */
export const HERO_ON_DARK_TEXT_STYLE = {
  color: "var(--color-static-content-primary-light)",
} as const

/** Figma PIN countdown — Body XS compact on dark PIN card (`16161:32302`). */
export const PIN_COUNTDOWN_TEXT_STYLE = {
  color: "var(--content-secondary-inverted)",
  lineHeight: "15px",
  fontFeatureSettings: "'cv03' 1, 'cv04' 1",
} as const

/** Figma claimed-offer details row — e.g. "30% off your bill" (`16123:18340`). */
export function formatClaimedOfferFoodLabel(discountPercent: number): string {
  return formatOfferDiscountTitle(discountPercent, false)
}

/** Pay footer subtitle (Figma `16123:18340`). */
export function formatClaimedOfferDiscountSubtitle(discountPercent: number): string {
  return `${discountPercent}% discount`
}

export function formatClaimedOfferPaymentLabel(paymentMethod: PaymentMethod): string {
  return paymentMethod === "dineout" ?
      CLAIMED_OFFER_PAYMENT_LABELS.dineout
    : CLAIMED_OFFER_PAYMENT_LABELS.cardOrCash
}

export function formatWelcomeAtRestaurant(restaurantName: string): string {
  return `Welcome at ${restaurantName}`
}

/** Figma claimed-offer details row — singular/plural-safe guest count. */
export function formatGuestCountLabel(guestCount: number): string {
  return guestCount === 1 ? "1 guest" : `${guestCount} guests`
}
