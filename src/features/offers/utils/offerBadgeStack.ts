import type { RestaurantTimedOffer } from "@/features/offers/data/restaurantOffers.types"
import { formatTimeWindowLabel } from "@/features/offers/utils/offerCampaign"

export type TimedOfferBadgeRow =
  | {
      kind: "offer"
      discountLabel: string
      timeWindow: string
    }
  | {
      kind: "overflow"
      /** Number of offers not shown in the first two pills (third pill text `+count offers`). */
      count: number
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
): TimedOfferBadgeRow[] {
  if (offers.length === 0) return []
  const sorted = sortTimedOffersForBadges(offers)

  if (sorted.length <= 3) {
    return sorted.map((offer) => ({
      kind: "offer" as const,
      discountLabel: `-${offer.discountPercent}%`,
      timeWindow: formatTimeWindowLabel(offer.window),
    }))
  }

  const [a, b] = sorted
  const overflow = sorted.length - 2
  return [
    {
      kind: "offer",
      discountLabel: `-${a.discountPercent}%`,
      timeWindow: formatTimeWindowLabel(a.window),
    },
    {
      kind: "offer",
      discountLabel: `-${b.discountPercent}%`,
      timeWindow: formatTimeWindowLabel(b.window),
    },
    { kind: "overflow", count: overflow },
  ]
}
