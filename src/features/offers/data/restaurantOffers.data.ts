import type {
  RestaurantSlug,
  RestaurantTimedOffer,
} from "./restaurantOffers.types"

/**
 * Canonical offer windows per restaurant (prototype data).
 * Times are 24h `HH:MM`; display formatting (en dash) happens in utils.
 */
export const RESTAURANT_OFFERS: Record<RestaurantSlug, RestaurantTimedOffer[]> =
  {
    "three-chefs": [
      {
        discountPercent: 25,
        window: { kind: "range", start: "18:00", end: "22:00" },
        remainingSpots: 1,
      },
      {
        discountPercent: 15,
        window: { kind: "range", start: "12:00", end: "15:00" },
        remainingSpots: 7,
      },
      { discountPercent: 10, window: { kind: "all-day" }, remainingSpots: 12 },
    ],
    neiburgs: [
      {
        discountPercent: 20,
        window: { kind: "range", start: "19:00", end: "23:00" },
        remainingSpots: 3,
      },
      {
        discountPercent: 15,
        window: { kind: "range", start: "11:00", end: "14:00" },
        remainingSpots: 5,
      },
      { discountPercent: 10, window: { kind: "all-day" }, remainingSpots: 9 },
    ],
    "melna-bite": [
      { discountPercent: 15, window: { kind: "all-day" }, remainingSpots: 10 },
      { discountPercent: 30, window: { kind: "range", start: "10:00", end: "13:00" } },
    ],
    kolonade: [
      { discountPercent: 20, window: { kind: "all-day" }, remainingSpots: 2 },
      {
        discountPercent: 10,
        window: { kind: "range", start: "12:00", end: "15:00" },
        remainingSpots: 8,
      },
    ],
    "max-cekot": [
      {
        discountPercent: 30,
        window: { kind: "range", start: "18:00", end: "21:00" },
        remainingSpots: 1,
      },
      { discountPercent: 15, window: { kind: "all-day" }, remainingSpots: 6 },
    ],
    rozengrals: [
      { discountPercent: 25, window: { kind: "all-day" }, remainingSpots: 9 },
      {
        discountPercent: 10,
        window: { kind: "range", start: "17:00", end: "20:00" },
        remainingSpots: 3,
      },
    ],
  }

export function getRestaurantOffers(slug: string): RestaurantTimedOffer[] {
  const key = slug as RestaurantSlug
  return RESTAURANT_OFFERS[key] ?? []
}
