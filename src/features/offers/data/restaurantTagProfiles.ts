/**
 * Canonical venue tag lines + positioning copy for prototype restaurants.
 * Keyed by `restaurantSlug` (map / offers / search).
 */

import type { OfferCardModel } from "../offers.types"

export type RestaurantTagProfile = {
  /** Single line under price / area, e.g. `Open Kitchen · Tasting Menu · …`. */
  tags: string
  /** Richer pitch for tooltips, detail screens, marketing reuse. */
  tagDescription: string
}

export const RESTAURANT_TAG_PROFILES: Record<string, RestaurantTagProfile> = {
  "three-chefs": {
    tags: "Open Kitchen · Tasting Menu · Latvian Chefs",
    tagDescription:
      "Its defining features — the visible kitchen and chef-driven tasting format",
  },
  neiburgs: {
    tags: "Michelin Listed · Wine Pairing · Seasonal Menu",
    tagDescription: "Credibility markers that drive bookings",
  },
  "melna-bite": {
    tags: "Modern Latvian · Farm to Table",
    tagDescription:
      "Captures its core identity — local sourcing with a contemporary twist",
  },
  kolonade: {
    tags: "Park Terrace · City Views · Fine Dining",
    tagDescription: "The setting is its biggest differentiator",
  },
  "max-cekot": {
    tags: "Set Menu Only · Chef's Table · Industrial Space",
    tagDescription:
      "Unique format + unusual location — exactly what sets it apart",
  },
  rozengrals: {
    tags: "Medieval Vault · Historic · Traditional",
    tagDescription: "The 1293 vault is the whole experience",
  },
}

export function getRestaurantTagProfile(
  restaurantSlug: string | undefined,
): RestaurantTagProfile | undefined {
  if (!restaurantSlug) return undefined
  return RESTAURANT_TAG_PROFILES[restaurantSlug]
}

/** Merges profile tag line + description onto an offer card (discover carousels / XL). */
export function withRestaurantTags(offer: OfferCardModel): OfferCardModel {
  const p = getRestaurantTagProfile(offer.restaurantSlug ?? offer.id)
  if (!p) return offer
  return {
    ...offer,
    cuisine: p.tags,
    tagDescription: p.tagDescription,
  }
}
