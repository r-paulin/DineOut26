import type { RestaurantOfferCardModel } from "@/features/restaurant/restaurantDetail.types"

/** Figma tab bottom slot — e.g. `-20%`. */
export function formatRestaurantOfferTabDiscountLabel(
  discountPercent: number,
): string {
  return `-${discountPercent}%`
}

/**
 * Tab discount from that date's offers — highest discount tier (Figma future-date tabs).
 */
export function resolveRestaurantOfferTabDiscountLabel(
  cards: readonly RestaurantOfferCardModel[],
): string | null {
  if (cards.length === 0) return null
  const maxDiscount = Math.max(...cards.map((c) => c.discountPercent))
  return formatRestaurantOfferTabDiscountLabel(maxDiscount)
}
