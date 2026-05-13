/**
 * Static search results: Riga venues (prototype).
 * Photos: `public/images/restaurants/` — raster filenames per venue (see repo).
 * Offer badges are derived from canonical offer data (`restaurantOffers`), not
 * marketing copy (e.g. set menu / medieval dinner).
 */

import { getRestaurantTagProfile } from "@/features/offers/data/restaurantTagProfiles"
import { restaurantImageUrl } from "@/shared/utils/publicImageUrls"

export type SearchResultRigaRow = {
  id: string
  /** Joins map / offers / time filter (`three-chefs`, `neiburgs`, …). */
  restaurantSlug: string
  name: string
  primaryImage: string
  sideTop: string
  sideBottom: string
  displayPrice: string
  area: string
  /** Tag line under meta; overridden from `restaurantTagProfiles` when present. */
  cuisine: string
  /** Richer pitch from venue profile (tooltip / future detail). */
  tagDescription?: string
  rating: string
  reviewSuffix: string
  primaryGrad?: boolean
}

const SEARCH_RESULTS_RIGA_BASE: SearchResultRigaRow[] = [
  {
    id: "three-chefs",
    restaurantSlug: "three-chefs",
    name: "3 Pavāru Restorāns",
    primaryImage: restaurantImageUrl("3pavarurestorans1.jpg"),
    sideTop: restaurantImageUrl("3pavarurestorans2.jpg"),
    sideBottom: restaurantImageUrl("3pavarurestorans3.jpg"),
    displayPrice: "35–55 €",
    area: "Old Town",
    cuisine: "",
    rating: "4.8",
    reviewSuffix: "(150+)",
    primaryGrad: true,
  },
  {
    id: "neiburgs",
    restaurantSlug: "neiburgs",
    name: "Neiburgs",
    primaryImage: restaurantImageUrl("Neiburgs-1.jpg"),
    sideTop: restaurantImageUrl("Neiburgs-2.jpg"),
    sideBottom: restaurantImageUrl("Neiburgs-3.jpg"),
    displayPrice: "40–65 €",
    area: "Old Town",
    cuisine: "",
    rating: "4.7",
    reviewSuffix: "(200+)",
    primaryGrad: true,
  },
  {
    id: "melna-bite",
    restaurantSlug: "melna-bite",
    name: "Melna Bite",
    primaryImage: restaurantImageUrl("Melna Bite 1.jpg"),
    sideTop: restaurantImageUrl("Melna Bite 2.jpg"),
    sideBottom: restaurantImageUrl("Melna Bite 3.jpg"),
    displayPrice: "20–35 €",
    area: "Old Town",
    cuisine: "",
    rating: "4.6",
    reviewSuffix: "(300+)",
    primaryGrad: true,
  },
  {
    id: "kolonade",
    restaurantSlug: "kolonade",
    name: "Kolonāde",
    primaryImage: restaurantImageUrl("kolonade-1.jpg"),
    sideTop: restaurantImageUrl("kolonade-2.jpg"),
    sideBottom: restaurantImageUrl("kolonade-3.jpg"),
    displayPrice: "30–50 €",
    area: "Vērmanes Garden",
    cuisine: "",
    rating: "4.7",
    reviewSuffix: "(180+)",
    primaryGrad: true,
  },
  {
    id: "max-cekot",
    restaurantSlug: "max-cekot",
    name: "Max Cekot Kitchen",
    primaryImage: restaurantImageUrl("max-cekot-1.jpg"),
    sideTop: restaurantImageUrl("max-cekot-1.jpg"),
    sideBottom: restaurantImageUrl("max-cekot-1.jpg"),
    displayPrice: "60–90 €",
    area: "Sarkandaugava",
    cuisine: "",
    rating: "4.9",
    reviewSuffix: "(80+)",
    primaryGrad: true,
  },
  {
    id: "rozengrals",
    restaurantSlug: "rozengrals",
    name: "Rozengrals",
    primaryImage: restaurantImageUrl("Rozengrals-1.jpg"),
    sideTop: restaurantImageUrl("Rozengrals-2.jpg"),
    sideBottom: restaurantImageUrl("Rozengrals-3.jpg"),
    displayPrice: "25–45 €",
    area: "Old Town",
    cuisine: "",
    rating: "4.5",
    reviewSuffix: "(400+)",
    primaryGrad: true,
  },
]

function mergeVenueTagProfile(row: SearchResultRigaRow): SearchResultRigaRow {
  const p = getRestaurantTagProfile(row.restaurantSlug)
  if (!p) return { ...row, cuisine: row.cuisine || "—" }
  return {
    ...row,
    cuisine: p.tags,
    tagDescription: p.tagDescription,
  }
}

/** Six Riga restaurants (order as curated list). */
export const SEARCH_RESULTS_RIGA: SearchResultRigaRow[] =
  SEARCH_RESULTS_RIGA_BASE.map(mergeVenueTagProfile)
