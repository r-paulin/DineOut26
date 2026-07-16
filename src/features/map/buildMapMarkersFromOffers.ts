import { restaurantTimedOfferOverlapsTimeSlot } from "@/features/discover/utils/filterDiscoverOffers"
import type { OfferCardModel } from "@/features/offers/offers.types"
import { hasCampaignBadges } from "@/features/offers/utils/mapPlaceCardView"
import type { TimeSlotId } from "@/features/search/filters.types"
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
 * One map marker per unique restaurant from the given offer rows.
 *
 * Pin enabled vs grey follows the discover **time-slot** filter (not the device
 * clock): `any` / Anytime → all enabled; a ranged slot → overlap = enabled,
 * non-overlap stays on the map in grey/closed style.
 */
export function buildMapMarkersFromOffers(
  offers: OfferCardModel[],
  timeSlot: TimeSlotId = "any",
): MapMarkerData[] {
  const unique = dedupeRestaurants(offers)
  const n = unique.length
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
      timedOfferActiveNow: restaurantTimedOfferOverlapsTimeSlot(
        restaurantKey,
        timeSlot,
      ),
    } satisfies MapMarkerData
  })
}
