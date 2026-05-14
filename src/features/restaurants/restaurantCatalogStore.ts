import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import type { RestaurantSlug } from "@/features/offers/data/restaurantOffers.types"
import type { RestaurantCatalogEntry } from "./restaurants.catalog"

const STORAGE_KEY = "dineout-admin-restaurant-catalog-v1"

export type RestaurantCatalogPersistState = {
  /** Full per-slug snapshots; when set, replace static defaults for that slug. */
  persistedBySlug: Partial<Record<RestaurantSlug, RestaurantCatalogEntry>>
  persistRestaurant: (slug: RestaurantSlug, entry: RestaurantCatalogEntry) => void
  resetSlug: (slug: RestaurantSlug) => void
  resetAll: () => void
}

export const useRestaurantCatalogStore = create<RestaurantCatalogPersistState>()(
  persist(
    (set) => ({
      persistedBySlug: {},
      persistRestaurant: (slug, entry) => {
        set((s) => ({
          persistedBySlug: { ...s.persistedBySlug, [slug]: { ...entry, slug } },
        }))
      },
      resetSlug: (slug) => {
        set((s) => {
          const next = { ...s.persistedBySlug }
          delete next[slug]
          return { persistedBySlug: next }
        })
      },
      resetAll: () => set({ persistedBySlug: {} }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ persistedBySlug: s.persistedBySlug }),
    },
  ),
)
