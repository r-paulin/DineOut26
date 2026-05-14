import { getMergedRestaurantCatalogEntry } from "@/features/restaurants/restaurantCatalogRuntime"
import type { RestaurantSlug } from "@/features/offers/data/restaurantOffers.types"

/** “What we serve” bullets (merged catalog including admin overrides). */
export function getDemoWhatWeServe(slug: RestaurantSlug): readonly string[] {
  return getMergedRestaurantCatalogEntry(slug)?.whatWeServe ?? []
}

/** Amenities list (merged catalog including admin overrides). */
export function getDemoAmenities(slug: RestaurantSlug): readonly string[] {
  return getMergedRestaurantCatalogEntry(slug)?.amenities ?? []
}
