import type { RestaurantTimedOffer } from "@/features/offers/data/restaurantOffers.types"
import { isTimedOfferDisplayActive } from "@/features/offers/utils/offerDisplayActive"
import { formatTimeWindowLabel } from "@/features/offers/utils/offerCampaign"

export type TimedOfferBadgeRow =
  | {
      kind: "offer"
      discountLabel: string
      timeWindow: string
      /** Green Offer icon vs muted `content/secondary-inverted` (15m pre-start grace). */
      iconActive: boolean
    }
  | {
      kind: "overflow"
      /** Number of offers not shown in the first two pills (third pill text `+count offers`). */
      count: number
      iconActive: boolean
    }

function sortTimedOffersForBadges(
  offers: readonly RestaurantTimedOffer[],
): RestaurantTimedOffer[] {
  return [...offers].map((o, index) => ({ o, index })).sort((a, b) => {
    if (b.o.discountPercent !== a.o.discountPercent) {
      return b.o.discountPercent - a.o.discountPercent
    }
    return a.index - b.index
  }).map(({ o }) => o)
}

/**
 * Up to three map/list badge rows: concrete `-% · time` rows, then `+N offers`
 * when more than two timed offers exist (Figma `_Place / Card` stack).
 */
export function buildTimedOfferBadgeModels(
  offers: readonly RestaurantTimedOffer[],
  now: Date = new Date(),
): TimedOfferBadgeRow[] {
  if (offers.length === 0) return []
  const sorted = sortTimedOffersForBadges(offers)

  const offerRow = (offer: RestaurantTimedOffer): TimedOfferBadgeRow => ({
    kind: "offer",
    discountLabel: `-${offer.discountPercent}%`,
    timeWindow: formatTimeWindowLabel(offer.window),
    iconActive: isTimedOfferDisplayActive(offer, now),
  })

  if (sorted.length <= 3) {
    return sorted.map(offerRow)
  }

  const [a, b] = sorted
  const hidden = sorted.slice(2)
  const overflow = hidden.length
  return [
    offerRow(a),
    offerRow(b),
    {
      kind: "overflow",
      count: overflow,
      iconActive: hidden.some((o) => isTimedOfferDisplayActive(o, now)),
    },
  ]
}
