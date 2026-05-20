import { useSyncExternalStore } from "react"
import type { RestaurantSlug } from "@/features/offers/data/restaurantOffers.types"
import {
  RESTAURANT_CATALOG_ORDER,
  RESTAURANTS_BY_SLUG,
  type RestaurantCatalogEntry,
} from "./restaurants.catalog"
import { useRestaurantCatalogStore } from "./restaurantCatalogStore"
import { stripAllDayTimedOffers } from "./sanitizeTimedOffers"

function normalizeCatalogEntry(e: RestaurantCatalogEntry): RestaurantCatalogEntry {
  return {
    ...e,
    images: { ...e.images },
    whatWeServe: [...e.whatWeServe],
    amenities: [...e.amenities],
    logoFilenames: [...e.logoFilenames],
    timedOffers: stripAllDayTimedOffers(e.timedOffers).map((t) => ({
      ...t,
      window: { ...t.window },
    })),
  }
}

/**
 * Effective catalog row: admin-persisted snapshot when present, otherwise static default.
 */
export function getMergedRestaurantCatalogEntry(
  slug: string,
): RestaurantCatalogEntry | undefined {
  const key = slug as RestaurantSlug
  const base = RESTAURANTS_BY_SLUG[key]
  if (!base) return undefined
  const persisted = useRestaurantCatalogStore.getState().persistedBySlug[key]
  if (persisted) return normalizeCatalogEntry(persisted)
  return base
}

/** Subscribe key for React: changes when persisted overrides change. */
export function useRestaurantCatalogSnapshot(): string {
  return useSyncExternalStore(
    (onStoreChange) => useRestaurantCatalogStore.subscribe(onStoreChange),
    () =>
      JSON.stringify(useRestaurantCatalogStore.getState().persistedBySlug),
    () => "{}",
  )
}

export function getRestaurantCatalogOrder(): readonly RestaurantSlug[] {
  return RESTAURANT_CATALOG_ORDER
}
