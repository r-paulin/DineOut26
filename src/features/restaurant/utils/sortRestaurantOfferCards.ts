import type { RestaurantOfferCardModel } from "@/features/restaurant/restaurantDetail.types"
import type { PaidOfferRecord } from "@/features/offers/offers.types"
import type { BannerState, UserClaim } from "@/features/restaurant/utils/offerState"
import {
  getOfferBannerState,
  toOfferForBanner,
} from "@/features/restaurant/utils/offerState"

/** Lower = earlier in the list: paid/claimed first, then claimable, then expired. */
function offerListSortRank(
  state: BannerState,
  isPaid: boolean,
): number {
  if (isPaid || state === "claimed") return 0
  if (state === "available") return 1
  return 2
}

/**
 * Orders offer rows for the restaurant list: **paid/claimed** first, then
 * **available** (claimable), then **expired** — stable within each band
 * ({@link getOfferBannerState}).
 */
export function sortRestaurantOfferCardsByClaim(
  cards: readonly RestaurantOfferCardModel[],
  userClaims: readonly UserClaim[],
  nowMs: number = Date.now(),
  paidOffersById: Readonly<Record<string, PaidOfferRecord>> = {},
): RestaurantOfferCardModel[] {
  const rank = (card: RestaurantOfferCardModel) =>
    offerListSortRank(
      getOfferBannerState(toOfferForBanner(card), userClaims, nowMs),
      paidOffersById[card.id] != null,
    )

  return [...cards].sort((a, b) => rank(a) - rank(b))
}
