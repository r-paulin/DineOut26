import type { RestaurantTimedOffer } from "@/features/offers/data/restaurantOffers.types"

/**
 * Prototype catalog uses ranged windows only. Legacy admin JSON or persisted
 * snapshots may still contain `{ kind: "all-day" }`; strip at merge so badges
 * and filters never show “All day”.
 */
export function stripAllDayTimedOffers(
  offers: readonly RestaurantTimedOffer[],
): RestaurantTimedOffer[] {
  return offers.filter((o) => o.window.kind !== "all-day")
}
