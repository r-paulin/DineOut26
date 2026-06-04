import { RESTAURANT_CATALOG_ORDER } from "@/features/restaurants/restaurants.catalog"
import { MAP_CENTER } from "./mapMarkers.data"

export function hash01(seed: string): number {
  let h = 0
  for (let i = 0; i < seed.length; i += 1) {
    h = Math.imul(31, h) + seed.charCodeAt(i)
    h |= 0
  }
  return (Math.abs(h) % 10_000) / 10_000
}

/**
 * Places each restaurant on a short ring around `MAP_CENTER` (same geometry as map pins).
 */
export function ringLatLng(
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

/** Stable prototype coordinates for a venue (catalog index). */
export function latLngForRestaurantSlug(
  slug: string,
  catalogOrder: readonly string[] = RESTAURANT_CATALOG_ORDER,
): { lat: number; lng: number } {
  const index = catalogOrder.indexOf(slug)
  const idx = index >= 0 ? index : 0
  return ringLatLng(idx, catalogOrder.length, slug)
}

/** Squared distance from mocked user / map center — for relative sort only. */
export function distanceSqFromMapCenter(
  slug: string,
  catalogOrder: readonly string[] = RESTAURANT_CATALOG_ORDER,
): number {
  const { lat, lng } = latLngForRestaurantSlug(slug, catalogOrder)
  const dLat = lat - MAP_CENTER.lat
  const dLng = lng - MAP_CENTER.lng
  return dLat * dLat + dLng * dLng
}
