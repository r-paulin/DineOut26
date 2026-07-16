import { distanceSqFromMapCenter } from "@/features/map/restaurantMapPosition"

/**
 * Prototype walk time from map center → venue ring position.
 * Label format matches Figma filtered list: `2min walk`.
 */
export function walkMinutesForRestaurantSlug(slug: string): number {
  const deg = Math.sqrt(distanceSqFromMapCenter(slug))
  const meters = deg * 111_000
  const metersPerMinute = 80
  return Math.max(1, Math.min(45, Math.round(meters / metersPerMinute)))
}

export function formatWalkMinutesLabel(minutes: number): string {
  return `${minutes}min walk`
}
