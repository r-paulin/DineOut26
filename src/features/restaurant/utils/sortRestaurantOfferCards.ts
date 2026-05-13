import type { RestaurantOfferCardModel } from "@/features/restaurant/restaurantDetail.types"
import type { BannerState, UserClaim } from "@/features/restaurant/utils/offerState"
import {
  getOfferBannerState,
  toOfferForBanner,
} from "@/features/restaurant/utils/offerState"

/** Lower = earlier in the list: claimed first (user’s offer is easy to find), then claimable, then expired. */
function offerListSortRank(state: BannerState): number {
  if (state === "claimed") return 0
  if (state === "available") return 1
  return 2
}

/**
 * Orders offer rows for the restaurant list: **claimed** first, then
 * **available** (claimable), then **expired** — stable within each band
 * ({@link getOfferBannerState}).
 */
export function sortRestaurantOfferCardsByClaim(
  cards: readonly RestaurantOfferCardModel[],
  userClaims: readonly UserClaim[],
  nowMs: number = Date.now(),
): RestaurantOfferCardModel[] {
  const rank = (card: RestaurantOfferCardModel) =>
    offerListSortRank(
      getOfferBannerState(toOfferForBanner(card), userClaims, nowMs),
    )

  return [...cards].sort((a, b) => rank(a) - rank(b))
}
