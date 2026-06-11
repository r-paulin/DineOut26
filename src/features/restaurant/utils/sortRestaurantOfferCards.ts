import { parseHHMMToMinutes } from "@/features/offers/utils/offerTimePicker"
import type { RestaurantOfferCardModel } from "@/features/restaurant/restaurantDetail.types"

/** Minutes from midnight for sort order; all-day offers sort first. */
function offerStartMinutes(card: RestaurantOfferCardModel): number {
  if (card.isAllDay) return 0
  if (card.offerStart != null) {
    const minutes = parseHHMMToMinutes(card.offerStart)
    if (minutes != null) return minutes
  }
  return Number.MAX_SAFE_INTEGER
}

/**
 * Orders offer rows for the restaurant list by window start time (earliest first).
 * All-day offers are treated as starting at midnight.
 */
export function sortRestaurantOfferCardsByStartTime(
  cards: readonly RestaurantOfferCardModel[],
): RestaurantOfferCardModel[] {
  return [...cards].sort(
    (a, b) => offerStartMinutes(a) - offerStartMinutes(b),
  )
}
