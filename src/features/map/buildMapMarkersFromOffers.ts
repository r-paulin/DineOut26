import { restaurantTimedOfferDisplayActiveNow } from "@/features/offers/utils/offerDisplayActive"
import type { OfferCardModel } from "@/features/offers/offers.types"
import { hasCampaignBadges } from "@/features/offers/utils/mapPlaceCardView"
import type { MapMarkerData } from "./map.types"
import { ringLatLng } from "./restaurantMapPosition"

function dedupeRestaurants(offers: OfferCardModel[]): OfferCardModel[] {
  const map = new Map<string, OfferCardModel>()
  for (const o of offers) {
    const key = o.restaurantSlug ?? o.id
    if (!map.has(key)) map.set(key, o)
  }
  return [...map.values()]
}

/**
 * One map marker per unique restaurant from the given offer rows (pre-filtered).
 */
export function buildMapMarkersFromOffers(offers: OfferCardModel[]): MapMarkerData[] {
  const unique = dedupeRestaurants(offers)
  const n = unique.length
  const now = new Date()
  return unique.map((o, index) => {
    const restaurantKey = o.restaurantSlug ?? o.id
    const { lat, lng } = ringLatLng(index, n, restaurantKey)
    const c = o.campaign
    return {
      id: `map-${restaurantKey}`,
      lat,
      lng,
      variant: "map_pin",
      label: o.name,
      discountText: hasCampaignBadges(c) ? c.discountLabel : undefined,
      restaurantId: restaurantKey,
      timedOfferActiveNow: restaurantTimedOfferDisplayActiveNow(restaurantKey, now),
    } satisfies MapMarkerData
  })
}
