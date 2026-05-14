import { getMergedRestaurantCatalogEntry } from "@/features/restaurants/restaurantCatalogRuntime"
import type {
  RestaurantSlug,
  RestaurantTimedOffer,
} from "./restaurantOffers.types"

/**
 * Times are 24h `HH:MM`; display formatting (en dash) happens in utils.
 */
export function getRestaurantOffers(slug: string): RestaurantTimedOffer[] {
  const key = slug as RestaurantSlug
  return getMergedRestaurantCatalogEntry(key)?.timedOffers ?? []
}
