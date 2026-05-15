import { restaurantTimedOfferDisplayActiveNow } from "@/features/offers/utils/offerDisplayActive"
import type { OfferCardModel } from "@/features/offers/offers.types"
import { hasCampaignBadges } from "@/features/offers/utils/mapPlaceCardView"
import type { MapMarkerData } from "./map.types"
import { MAP_CENTER } from "./mapMarkers.data"

function hash01(seed: string): number {
  let h = 0
  for (let i = 0; i < seed.length; i += 1) {
    h = Math.imul(31, h) + seed.charCodeAt(i)
    h |= 0
  }
  return (Math.abs(h) % 10_000) / 10_000
}

/**
 * Places each restaurant on a short ring around `MAP_CENTER` so the mocked user
 * (at center) sits clearly between pins in Vecrīga.
 */
function ringLatLng(
  index: number,
  total: number,
  restaurantKey: string,
): { lat: number; lng: number } {
  if (total < 1) return { ...MAP_CENTER }
  const baseAngle = (2 * Math.PI * index) / total
  const phase = (hash01(`${restaurantKey}:phase`) - 0.5) * 0.4
  const angle = baseAngle + phase
  const rMin = 0.001
  const rJitter = hash01(`${restaurantKey}:r`) * 0.00045
  const r = rMin + rJitter
  return {
    lat: MAP_CENTER.lat + r * Math.cos(angle),
    lng: MAP_CENTER.lng + r * Math.sin(angle),
  }
}

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
