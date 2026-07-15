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

function hasClaim(
  offerId: string,
  claimedOfferIds?: ReadonlySet<string> | Readonly<Record<string, unknown>>,
): boolean {
  if (claimedOfferIds == null) return false
  if (claimedOfferIds instanceof Set) return claimedOfferIds.has(offerId)
  return Object.prototype.hasOwnProperty.call(claimedOfferIds, offerId)
}

export interface SortRestaurantOfferCardsOptions {
  /** Offer ids the user has claimed — always sorted above unclaimed rows. */
  claimedOfferIds?: ReadonlySet<string> | Readonly<Record<string, unknown>>
}

/**
 * Orders offer rows for the restaurant list: claimed first, then by window
 * start time (earliest first). All-day offers are treated as starting at midnight.
 */
export function sortRestaurantOfferCardsByStartTime(
  cards: readonly RestaurantOfferCardModel[],
  options?: SortRestaurantOfferCardsOptions,
): RestaurantOfferCardModel[] {
  return [...cards].sort((a, b) => {
    const aClaimed = hasClaim(a.id, options?.claimedOfferIds)
    const bClaimed = hasClaim(b.id, options?.claimedOfferIds)
    if (aClaimed !== bClaimed) return aClaimed ? -1 : 1
    return offerStartMinutes(a) - offerStartMinutes(b)
  })
}
