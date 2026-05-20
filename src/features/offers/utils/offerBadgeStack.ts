import type { RestaurantTimedOffer } from "@/features/offers/data/restaurantOffers.types"
import { isTimedOfferLiveNow } from "@/features/discover/utils/filterDiscoverOffers"
import { formatTimeWindowLabel } from "@/features/offers/utils/offerCampaign"

export type BadgeStackMode = "default" | "liveNow"

export type TimedOfferBadgeRow =
  | {
      kind: "offer"
      discountLabel: string
      timeWindow: string
      /** White circle + red PercentFlower when true (Figma `16159:22611`). */
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
 *
 * - `default`: all offers; icons always active (claimable — no grey).
 * - `liveNow`: only strict-live windows; icons active on visible rows.
 */
export function buildTimedOfferBadgeModels(
  offers: readonly RestaurantTimedOffer[],
  now: Date = new Date(),
  mode: BadgeStackMode = "default",
): TimedOfferBadgeRow[] {
  if (offers.length === 0) return []

  const sorted =
    mode === "liveNow" ?
      sortTimedOffersForBadges(offers).filter((o) => isTimedOfferLiveNow(o, now))
    : sortTimedOffersForBadges(offers)

  if (sorted.length === 0) return []

  const iconActiveFor = (_offer: RestaurantTimedOffer): boolean => true

  const offerRow = (offer: RestaurantTimedOffer): TimedOfferBadgeRow => ({
    kind: "offer",
    discountLabel: `-${offer.discountPercent}%`,
    timeWindow: formatTimeWindowLabel(offer.window),
    iconActive: iconActiveFor(offer),
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
      iconActive: true,
    },
  ]
}
