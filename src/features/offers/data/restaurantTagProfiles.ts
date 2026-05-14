/**
 * Canonical venue tag lines + positioning copy for prototype restaurants.
 * Dynamic reads use merged catalog (admin overrides).
 */

import { getMergedRestaurantCatalogEntry } from "@/features/restaurants/restaurantCatalogRuntime"
import { RESTAURANTS_BY_SLUG } from "@/features/restaurants/restaurants.catalog"
import type { OfferCardModel } from "../offers.types"
import type { RestaurantSlug } from "./restaurantOffers.types"

export type RestaurantTagProfile = {
  /** Single line under price / area, e.g. `Open Kitchen · Tasting Menu · …`. */
  tags: string
  /** Richer pitch for tooltips, detail screens, marketing reuse. */
  tagDescription: string
}

/** Baseline profiles from shipped static catalog (not updated by admin at module level). */
export const RESTAURANT_TAG_PROFILES: Record<string, RestaurantTagProfile> =
  Object.fromEntries(
    (Object.keys(RESTAURANTS_BY_SLUG) as RestaurantSlug[]).map((slug) => {
      const e = RESTAURANTS_BY_SLUG[slug]
      return [slug, { tags: e.tags, tagDescription: e.tagDescription }]
    }),
  )

export function getRestaurantTagProfile(
  restaurantSlug: string | undefined,
): RestaurantTagProfile | undefined {
  if (!restaurantSlug) return undefined
  const e = getMergedRestaurantCatalogEntry(restaurantSlug)
  if (!e) return undefined
  return { tags: e.tags, tagDescription: e.tagDescription }
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
