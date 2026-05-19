import type { RestaurantTimedOffer } from "@/features/offers/data/restaurantOffers.types"

const SCARCITY_MIN = 1
const SCARCITY_MAX = 5

function isTimedOffer(o: RestaurantTimedOffer): boolean {
  return o.window.kind !== "all-day"
}

function scarcityScore(o: RestaurantTimedOffer): number | null {
  const spots = o.remainingSpots
  if (spots == null || spots < SCARCITY_MIN || spots > SCARCITY_MAX) return null
  return spots
}

/**
 * One claimable timed offer per venue for restaurant detail (Figma single banner).
 * Prefers lowest remaining spots in 1–5, else highest discount.
 */
export function selectPrimaryTimedOffer(
  offers: readonly RestaurantTimedOffer[],
): RestaurantTimedOffer | null {
  const timed = offers.filter(isTimedOffer)
  if (timed.length === 0) return null

  const withScarcity = timed.filter((o) => scarcityScore(o) != null)
  if (withScarcity.length > 0) {
    return withScarcity.reduce((best, o) => {
      const s = scarcityScore(o)!
      const bestS = scarcityScore(best)!
      if (s < bestS) return o
      if (s > bestS) return best
      return o.discountPercent > best.discountPercent ? o : best
    })
  }

  return timed.reduce((best, o) =>
    o.discountPercent > best.discountPercent ? o : best,
  )
}

/** Clamp scarcity display to product max (5). */
export function clampRemainingSpotsForDisplay(
  spots: number | undefined,
): number | undefined {
  if (spots == null || spots < SCARCITY_MIN) return undefined
  return Math.min(spots, SCARCITY_MAX)
}

export function shouldShowScarcitySticker(remainingCount: number | undefined): boolean {
  return (
    remainingCount != null &&
    remainingCount >= SCARCITY_MIN &&
    remainingCount <= SCARCITY_MAX
  )
}
