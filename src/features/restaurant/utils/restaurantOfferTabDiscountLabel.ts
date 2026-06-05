import type { RestaurantOfferCardModel } from "@/features/restaurant/restaurantDetail.types"

/** Figma tab bottom slot — e.g. `20% off`. */
export function formatRestaurantOfferTabDiscountLabel(
  discountPercent: number,
): string {
  return `${discountPercent}% off`
}

/**
 * Tab discount from that date's offers: unique tiers sorted high→low, pick by tab
 * index so consecutive offer days can show different % (Figma `16144:20153`).
 */
export function resolveRestaurantOfferTabDiscountLabel(
  cards: readonly RestaurantOfferCardModel[],
  tabIndex: number,
): string | null {
  if (cards.length === 0) return null
  const tiers = [
    ...new Set(cards.map((c) => c.discountPercent)),
  ].sort((a, b) => b - a)
  const pct = tiers[Math.min(tabIndex, tiers.length - 1)]
  if (pct == null) return null
  return formatRestaurantOfferTabDiscountLabel(pct)
}
